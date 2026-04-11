import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";
import { SettlementEngine } from "@/lib/settlementEngine";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id: groupId } = await params;

    const group = await Group.findById(groupId).populate("members", "name");
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const expenses = await Expense.find({ groupId });
    const settlements = await Settlement.find({ groupId });
    const memberIds = group.members.map((m: any) => m._id.toString());

    // Calculate simplified debts
    const simplifiedDebts = SettlementEngine.simplifyDebts(expenses, settlements, memberIds);

    // Also calculate individual summary balances
    const individualBalances = memberIds.map((id: string) => {
        let net = 0;
        expenses.forEach(e => {
            if (e.paidBy.toString() === id) net += e.amount;
            const mySplit = e.splits.find((s: any) => s.userId.toString() === id);
            if (mySplit) net -= mySplit.amount;
        });

        // Add settlements
        settlements.forEach(s => {
            if (s.fromId.toString() === id) net += s.amount;
            if (s.toId.toString() === id) net -= s.amount;
        });
        return {
            userId: id,
            name: group.members.find((m: any) => m._id.toString() === id)?.name,
            netBalance: parseFloat(net.toFixed(2))
        };
    });

    return NextResponse.json({ 
        simplifiedDebts, 
        individualBalances 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
