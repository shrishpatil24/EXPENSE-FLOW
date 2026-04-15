import { TransactionHealth } from "@/lib/transactionHealth";
import User from "@/models/User";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";
import { SettlementEngine } from "@/lib/settlementEngine";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateCreditScore, calculateOverduePenalty } from "@/lib/creditEngine";
import CreditHistory from "@/models/CreditHistory";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Fetch User metadata
    const user = await User.findById(userId).select("creditScore totalSettled");

    // Fetch all groups where user is a member
    const groups = await Group.find({ "members": userId }).populate("members", "name");
    
    const allDebts: any[] = [];
    const allCredits: any[] = [];

    for (const group of groups) {
      const groupId = group._id;
      const expenses = await Expense.find({ groupId }).sort({ date: 1 }); // Oldest first to find origin of debt
      const settlements = await Settlement.find({ groupId });
      const memberIds = group.members.map((m: any) => m._id.toString());

      // Use SettlementEngine to calculate simplified debts for this group
      const simplifiedDebts = SettlementEngine.simplifyDebts(expenses, settlements, memberIds);

      simplifiedDebts.forEach(debt => {
          if (debt.from === userId) {
              const toUser = group.members.find((m: any) => m._id.toString() === debt.to);
              
              // Find oldest expense where current user owed something in this group
              const oldestRelevantExpense = expenses.find(e => 
                e.splits.some((s: any) => s.userId.toString() === userId)
              );

              allDebts.push({
                  groupId: group._id,
                  groupName: group.name,
                  toName: toUser?.name || "Member",
                  toId: debt.to,
                  amount: debt.amount,
                  health: TransactionHealth.calculate(oldestRelevantExpense?.date || new Date())
              });
          } else if (debt.to === userId) {
              const fromUser = group.members.find((m: any) => m._id.toString() === debt.from);
              allCredits.push({
                  groupId: group._id,
                  groupName: group.name,
                  fromName: fromUser?.name || "Member",
                  fromId: debt.from,
                  amount: debt.amount
              });
          }
      });
    }

    // --- Passive Credit Score Decay ---
    // If user has old debts and hasn't had a penalty in the last 24h, apply one.
    if (allDebts.length > 0) {
      const lastPenalty = await CreditHistory.findOne({ 
        userId, 
        reason: { $regex: /Overdue/i },
        timestamp: { $gt: new Date(Date.now() - 24*60*60*1000) }
      });

      if (!lastPenalty) {
        // Find oldest debt
        const oldestDebt = allDebts.reduce((min, d) => 
          (d.health.daysOld > min.health.daysOld) ? d : min, 
          allDebts[0]
        );
        
        const penalty = calculateOverduePenalty(new Date(Date.now() - (oldestDebt.health.daysOld * 86400000)));
        if (penalty < 0) {
          await updateCreditScore(userId, penalty, `Overdue debt in "${oldestDebt.groupName}"`);
          // Refresh user data after update
          const updatedUser = await User.findById(userId).select("creditScore");
          if (user && updatedUser) {
            (user as any).creditScore = updatedUser.creditScore;
          }
        }
      }
    }

    return NextResponse.json({ 
      debts: allDebts, 
      credits: allCredits,
      user: {
        creditScore: user?.creditScore || 1000,
        totalSettled: user?.totalSettled || 0,
        rating: TransactionHealth.getOverallStatus(user?.creditScore || 1000)
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
