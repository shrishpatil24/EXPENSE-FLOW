import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";
import { verifyToken } from "@/lib/auth";
import { publishGroupLedgerInvalidation } from "@/lib/groupEventBus";

/**
 * DELETE /api/groups/[id]
 * Deletes a group and all associated expenses/settlements.
 * ADMIN-only action.
 */
export async function DELETE(
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

    publishGroupLedgerInvalidation(id, { reason: "group_deleted" });

    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // ADMIN permission check
    const callerRole = group.roles?.find(
      (r: any) => r.userId.toString() === decoded.userId
    );
    if (!callerRole || callerRole.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only group admins can delete a group" },
        { status: 403 }
      );
    }

    await Group.findByIdAndDelete(id);
    await Expense.deleteMany({ groupId: id });
    await Settlement.deleteMany({ groupId: id });

    return NextResponse.json({
      message: "Group and all associated data deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
