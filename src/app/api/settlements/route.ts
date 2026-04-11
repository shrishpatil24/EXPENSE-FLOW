import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Settlement from "@/models/Settlement";
import LedgerAudit from "@/models/LedgerAudit";
import { verifyToken } from "@/lib/auth";
import { publishGroupLedgerInvalidation } from "@/lib/groupEventBus";

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

    const { fromId, toId, groupId, amount } = await req.json();

    if (!fromId || !toId || !groupId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await mongoose.startSession();
    let settlement: InstanceType<typeof Settlement> | undefined;

    try {
      await session.withTransaction(async () => {
        const created = await Settlement.create(
          [
            {
              fromId,
              toId,
              groupId,
              amount,
              status: "COMPLETED",
            },
          ],
          { session }
        );
        settlement = created[0];
        await LedgerAudit.create(
          [
            {
              groupId,
              action: "SETTLEMENT_RECORDED",
              meta: {
                settlementId: String(settlement!._id),
                fromId: String(fromId),
                toId: String(toId),
                amount,
              },
            },
          ],
          { session }
        );
      });
    } finally {
      session.endSession();
    }

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement write failed" },
        { status: 500 }
      );
    }

    publishGroupLedgerInvalidation(String(groupId), { reason: "settlement" });

    return NextResponse.json(
      { message: "Settlement recorded", settlement },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const settlements = await Settlement.find({ groupId })
      .populate("fromId", "name")
      .populate("toId", "name")
      .sort({ date: -1 });

    return NextResponse.json({ settlements }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
