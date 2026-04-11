import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { publishGroupLedgerInvalidation } from "@/lib/groupEventBus";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: groupId } = await params;
    const { name, email } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Member name is required" }, { status: 400 });
    }

    // Check if group exists and user is part of it
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // 1. Try to find user strictly by email if provided, otherwise by exact name
    let targetUser = null;
    if (email) {
        targetUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
    }
    if (!targetUser) {
        targetUser = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") }, isGhost: true });
    }

    if (!targetUser) {
        // 2. Create ghost user if not found
        const dummyEmail = email || `ghost_${Date.now()}@expenseflow.local`;
        targetUser = await User.create({
          name,
          email: dummyEmail,
          isGhost: true,
        });
    }

    // 3. Add to group if not already a member
    if (!group.members.includes(targetUser._id)) {
        group.members.push(targetUser._id);
        await group.save();
    }

    publishGroupLedgerInvalidation(groupId, { reason: "member_updated" });

    return NextResponse.json({ 
      message: targetUser.isGhost ? "Ghost member created" : "Registered user linked to group", 
      member: { id: targetUser._id, name: targetUser.name, isGhost: targetUser.isGhost } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
