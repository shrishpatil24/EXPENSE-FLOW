import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CreditHistory from "@/models/CreditHistory";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { TransactionHealth } from "@/lib/transactionHealth";

/**
 * GET /api/user/credit-history
 * Returns the authenticated user's credit score timeline.
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

    const { userId } = decoded;

    const [user, history] = await Promise.all([
      User.findById(userId).select("creditScore totalSettled name"),
      CreditHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(30),
    ]);

    return NextResponse.json({
      currentScore: user?.creditScore ?? 1000,
      rating: TransactionHealth.getOverallStatus(user?.creditScore ?? 1000),
      totalSettled: user?.totalSettled ?? 0,
      history: history.reverse(), // Oldest first for charting
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
