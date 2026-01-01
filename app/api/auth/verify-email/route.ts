import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find verification token
    const [token] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp),
          gt(verificationTokens.expires, new Date())
        )
      )
      .limit(1);

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Verify user email
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email));

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp)
        )
      );

    return NextResponse.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

