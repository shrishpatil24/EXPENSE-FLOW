import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("[AUTH] Register: Connecting to DB...");
    await dbConnect();
    console.log("[AUTH] Register: Parsing request body...");
    const { name, email, password } = await req.json();
    console.log(`[AUTH] Register: Attempting to find user: ${email}`);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isGhost: false,
    });

    const token = signToken(user._id.toString());

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[AUTH] Register Error:", error);
    
    if (error.name === "MongooseServerSelectionError" || error.message.includes("authentication failed")) {
      return NextResponse.json(
        { error: "Database authentication failed. Please check your credentials in .env.local and ensure your IP is whitelisted in Atlas." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
