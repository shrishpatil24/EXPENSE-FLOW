import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token and saves it in the DB.
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

    // For security, don't reveal if user exists. 
    // Just return success even if not found.
    if (user && !user.isGhost) {
      // Generate unique token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

      // Save token in DB (invalidate previous tokens for same email if any)
      await PasswordResetToken.deleteMany({ email: user.email });
      await PasswordResetToken.create({
        email: user.email,
        token,
        expiresAt,
      });

      // Simulation: Log the token instead of sending email
      console.log(`[AUTH] Password Reset Token for ${user.email}: ${token}`);
    }

    return NextResponse.json(
      { message: "If an account matches that email, a reset token has been generated." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
