import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";

/**
 * GET /api/expenses/[id]/audit
 * Returns full audit trail for an expense.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const logs = await AuditLog.find({ expenseId: id })
      .populate("editedBy", "name email")
      .sort({ timestamp: -1 });

    return NextResponse.json({ auditLogs: logs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
