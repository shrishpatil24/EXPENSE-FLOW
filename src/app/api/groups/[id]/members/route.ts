import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    // Create ghost user
    // Note: We use a unique dummy email if none provided to satisfy schema
    const dummyEmail = email || `ghost_${Date.now()}_${Math.random().toString(36).substring(7)}@expenseflow.local`;
    
    const ghostUser = await User.create({
      name,
      email: dummyEmail,
      isGhost: true,
    });

    // Add to group
    group.members.push(ghostUser._id);
    await group.save();

    return NextResponse.json({ 
      message: "Member added successfully", 
      member: { id: ghostUser._id, name: ghostUser.name, isGhost: true } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
