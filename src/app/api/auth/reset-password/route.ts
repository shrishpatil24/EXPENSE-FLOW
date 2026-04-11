import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and new password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "No account matches that email address" },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(password);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return NextResponse.json(
      { message: "Password reset successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
