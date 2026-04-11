import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";

export async function GET() {
  try {
    await dbConnect();
    
    const ghostId = "69d90413a9713d40d8922592"; // The old ghost picked up by mistake
    const realId = "69d9bbcca9713d40d892259f";  // The real shri@rent.com account

    // 1. Update Groups
    const groups = await Group.find({ members: ghostId });
    for (const g of groups) {
      g.members = g.members.filter((m: any) => m.toString() !== ghostId);
      if (!g.members.includes(realId)) {
        g.members.push(realId);
      }
      await g.save();
    }

    // 2. Update Expenses where paidBy was the ghost
    await Expense.updateMany({ paidBy: ghostId }, { $set: { paidBy: realId } });
    
    // Update Expenses splits
    const expenses = await Expense.find({ "splits.userId": ghostId });
    for (const e of expenses) {
        e.splits.forEach((split: any) => {
            if (split.userId.toString() === ghostId) {
                split.userId = realId;
            }
        });
        await e.save();
    }

    // 3. Update Settlements
    await Settlement.updateMany({ from: ghostId }, { $set: { from: realId } });
    await Settlement.updateMany({ to: ghostId }, { $set: { to: realId } });

    // 4. Delete the ghost
    await User.findByIdAndDelete(ghostId);

    return NextResponse.json({ message: "Repaired Shri's account connection!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
