import { NextResponse } from "next/server";
import { getAnonymousSessionId, createAnonymousSessionCookie } from "@/lib/anonymous-session";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function GET() {
  // Check if session already exists
  const existing = await getAnonymousSessionId();
  if (existing) {
    return NextResponse.json({ sessionId: existing });
  }

  // Create new session
  const sessionId = nanoid(32);
  await createAnonymousSessionCookie(sessionId);

  return NextResponse.json({ sessionId });
}

