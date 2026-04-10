import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense, { SplitType } from "@/models/Expense";
import Group from "@/models/Group";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
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

    const { 
      description, 
      amount, 
      groupId, 
      paidBy, 
      splitType, 
      participants // Array of { userId, value? }
    } = await req.json();

    if (!description || !amount || !groupId || !paidBy || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify if payor and group exist
    const group = await Group.findById(groupId);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // --- Split Calculation Logic ---
    let computedSplits = [];
    
    if (splitType === SplitType.EQUAL) {
      const splitAmount = parseFloat((amount / participants.length).toFixed(2));
      const totalComputed = splitAmount * participants.length;
      const diff = parseFloat((amount - totalComputed).toFixed(2));
      
      computedSplits = participants.map((p: any, index: number) => ({
        userId: p.userId,
        // Give the remaining penny to the first person to avoid balance mismatch
        amount: index === 0 ? splitAmount + diff : splitAmount
      }));
    } 
    else if (splitType === SplitType.PERCENTAGE) {
      let totalPercent = 0;
      computedSplits = participants.map((p: any) => {
        const pAmount = parseFloat(((p.value / 100) * amount).toFixed(2));
        totalPercent += p.value;
        return {
          userId: p.userId,
          amount: pAmount,
          percentage: p.value
        };
      });
      if (Math.round(totalPercent) !== 100) {
        return NextResponse.json({ error: "Total percentage must be 100" }, { status: 400 });
      }
    }
    else if (splitType === SplitType.EXACT) {
      let totalExact = 0;
      computedSplits = participants.map((p: any) => {
        totalExact += p.value;
        return { userId: p.userId, amount: p.value };
      });
      if (Math.round(totalExact) !== Math.round(amount)) {
        return NextResponse.json({ error: "Exact amounts must sum to total" }, { status: 400 });
      }
    }
    else if (splitType === SplitType.SHARES) {
      const totalShares = participants.reduce((acc: number, p: any) => acc + p.value, 0);
      computedSplits = participants.map((p: any) => ({
        userId: p.userId,
        amount: parseFloat(((p.value / totalShares) * amount).toFixed(2)),
        shares: p.value
      }));
    }

    // Create the expense
    const expense = await Expense.create({
      description,
      amount,
      groupId,
      paidBy,
      splitType,
      splits: computedSplits,
    });

    return NextResponse.json({ message: "Expense recorded", expense }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
      await dbConnect();
      const { searchParams } = new URL(req.url);
      const groupId = searchParams.get("groupId");
  
      if (!groupId) {
        return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
      }
  
      const expenses = await Expense.find({ groupId })
        .populate("paidBy", "name")
        .populate("splits.userId", "name")
        .sort({ date: -1 });
  
      return NextResponse.json({ expenses }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
