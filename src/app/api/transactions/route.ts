import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { TransactionManager } from "@/lib/transactionManager";
import Settlement from "@/models/Settlement";
import { updateCreditScore, calculateSettlementDelta } from "@/lib/creditEngine";
import { createNotification, NotificationTemplates } from "@/lib/notificationEngine";
import User from "@/models/User";
import Group from "@/models/Group";
import Expense from "@/models/Expense";

/**
 * POST /api/transactions
 * Initiates an ACID transaction for a settlement or expense.
 * Runs full lifecycle: INITIATED → PENDING → LOCKED → COMMITTED
 */
export async function POST(req: Request) {
  let txnId: string | null = null;

  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { type, groupId, payload } = await req.json();
    if (!type || !groupId || !payload) {
      return NextResponse.json({ error: "Missing type, groupId, or payload" }, { status: 400 });
    }

    // Phase 1: INITIATE
    const txn = await TransactionManager.initiate(type, groupId, decoded.userId, payload);
    txnId = txn._id.toString();

    // Phase 2: Check for deadlocks before proceeding
    const isDeadlock = await TransactionManager.hasDeadlock(groupId, txnId);
    if (isDeadlock) {
      await TransactionManager.resolveDeadlock(groupId, txnId);
    }

    // Phase 3: PENDING — validate pre-conditions
    const pendingTxn = await TransactionManager.toPending(txnId);
    if (!pendingTxn) throw new Error("Failed to move to pending state");

    // Phase 4: LOCK
    const lockedTxn = await TransactionManager.lock(txnId, pendingTxn.version);
    if (!lockedTxn) throw new Error("Could not acquire lock. Concurrent transaction in progress.");

    // Phase 5: EXECUTE (actual DB write)
    let result: any = null;

    if (type === "SETTLEMENT") {
      const { fromId, toId, amount } = payload;
      if (!fromId || !toId || !amount) throw new Error("Missing settlement payload fields");

      // Create settlement record
      result = await Settlement.create({ fromId, toId, groupId, amount, status: "COMPLETED" });

      // Update totalSettled on the payer
      await User.findByIdAndUpdate(fromId, { $inc: { totalSettled: amount } });

      // Credit score update — find oldest related expense as debt origin
      const oldestExpense = await Expense.findOne({
        groupId,
        "splits.userId": fromId,
      }).sort({ date: 1 });

      const delta = calculateSettlementDelta(oldestExpense?.date || new Date());
      const creditResult = await updateCreditScore(fromId, delta, `Settled ₹${amount} in group`);

      // Notifications
      const fromUser = await User.findById(fromId).select("name");
      const toUser = await User.findById(toId).select("name");
      const group = await Group.findById(groupId).select("name");

      await Promise.all([
        createNotification(
          toId,
          NotificationTemplates.settlementCompleted(amount, fromUser?.name || "Someone"),
          "SETTLEMENT_COMPLETED",
          { groupId, settlementId: result._id }
        ),
        createNotification(
          fromId,
          NotificationTemplates.creditScoreUpdate(creditResult.delta, creditResult.newScore),
          "CREDIT_SCORE_UPDATE",
          { delta: creditResult.delta, newScore: creditResult.newScore }
        ),
      ]);
    }

    // Phase 6: COMMIT
    const committed = await TransactionManager.commit(txnId, lockedTxn.version);

    return NextResponse.json(
      { message: "Transaction committed", transaction: committed, result },
      { status: 201 }
    );
  } catch (error: any) {
    // Rollback on any failure
    if (txnId) {
      await TransactionManager.fail(txnId, error.message);
      await TransactionManager.rollback(txnId, error.message);
    }
    return NextResponse.json({ error: error.message, txnId }, { status: 500 });
  }
}

/**
 * GET /api/transactions
 * Returns recent transactions for the authenticated user's groups.
 */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const query: any = { initiatedBy: decoded.userId };
    if (groupId) query.groupId = groupId;

    const { default: TransactionModel } = await import("@/models/Transaction");
    const transactions = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
