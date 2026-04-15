import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // 1. Find all groups the user is part of
    const userGroups = await Group.find({ members: userId }).select("_id name");
    const groupIds = userGroups.map(g => g._id);

    if (groupIds.length === 0) {
      return NextResponse.json({ transactions: [] }, { status: 200 });
    }

    // 2. Fetch recent expenses and settlements across these groups
    const [expenses, settlements] = await Promise.all([
      Expense.find({ groupId: { $in: groupIds } })
        .sort({ date: -1 })
        .limit(10)
        .populate("paidBy", "name")
        .populate("groupId", "name"),
      Settlement.find({ groupId: { $in: groupIds } })
        .sort({ date: -1 })
        .limit(10)
        .populate("fromId", "name")
        .populate("toId", "name")
        .populate("groupId", "name")
    ]);

    // 3. Combine and unify the format
    const unifiedTransactions = [
      ...expenses.map((e: any) => ({
        _id: e._id,
        type: "EXPENSE",
        description: e.description,
        amount: e.amount,
        groupName: e.groupId.name,
        userName: e.paidBy.name,
        date: e.date,
        isOwnAction: e.paidBy._id.toString() === userId
      })),
      ...settlements.map((s: any) => ({
        _id: s._id,
        type: "SETTLEMENT",
        description: `Payment from ${s.fromId.name} to ${s.toId.name}`,
        amount: s.amount,
        groupName: s.groupId.name,
        userName: s.fromId.name,
        date: s.date,
        isOwnAction: s.fromId._id.toString() === userId || s.toId._id.toString() === userId
      }))
    ];

    // 4. Final sort and limit
    const finalTransactions = unifiedTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    return NextResponse.json({ transactions: finalTransactions }, { status: 200 });
  } catch (error: any) {
    console.error("Recent Transactions API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
