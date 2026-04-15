import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import AuditLog from "@/models/AuditLog";
import { verifyToken } from "@/lib/auth";

/**
 * PATCH /api/expenses/[id]
 * Edits an existing expense and writes a field-level audit log entry.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const updates = await req.json();
    const allowedFields = ["description", "amount", "category", "date"];

    // Fetch existing expense for comparison
    const existing = await Expense.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Build diff for audit trail
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    for (const field of allowedFields) {
      if (updates[field] !== undefined && String(updates[field]) !== String((existing as any)[field])) {
        changes.push({
          field,
          oldValue: (existing as any)[field],
          newValue: updates[field],
        });
        (existing as any)[field] = updates[field];
      }
    }

    if (changes.length === 0) {
      return NextResponse.json({ message: "No changes detected" }, { status: 200 });
    }

    await existing.save();

    // Write audit log
    await AuditLog.create({
      expenseId: id,
      editedBy: decoded.userId,
      changes,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { message: "Expense updated", expense: existing },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/expenses/[id] — already exists in separate file, this PATCH is additive
 */
