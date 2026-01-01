import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendOTPEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // 10 minutes

    // Create user (unverified)
    const userId = nanoid();
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name || null,
      emailVerified: null,
    });

    // Store OTP
    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError: any) {
      console.error("Email sending error:", emailError);
      // Still return success, but log the error
      // In production, you might want to handle this differently
      return NextResponse.json(
        { 
          error: "Failed to send verification email. Please check your SMTP configuration.",
          details: process.env.NODE_ENV === "development" ? emailError.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registration successful. Please check your email for the verification code.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

