import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq, or, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAuthDisabled } from "@/lib/auth-helper";
import { getAnonymousSessionId, createAnonymousSessionCookie } from "@/lib/anonymous-session";

export const runtime = "nodejs";

async function getEndpointOwner() {
  if (isAuthDisabled()) {
    let sessionId = await getAnonymousSessionId();
    if (!sessionId) {
      // Create new session in this route handler (where we can set cookies)
      sessionId = nanoid(32);
      await createAnonymousSessionCookie(sessionId);
    }
    return { type: "anonymous" as const, id: sessionId };
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return { type: "user" as const, id: session.user.id };
}

export async function GET() {
  try {
    const owner = await getEndpointOwner();

    const userEndpoints = await db
      .select()
      .from(endpoints)
      .where(
        owner.type === "anonymous"
          ? eq(endpoints.anonymousSessionId, owner.id)
          : eq(endpoints.userId, owner.id)
      )
      .orderBy(endpoints.createdAt);

    return NextResponse.json(userEndpoints);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getEndpointOwner();

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = nanoid(12);
    const id = nanoid();

    await db.insert(endpoints).values({
      id,
      userId: owner.type === "user" ? owner.id : null,
      anonymousSessionId: owner.type === "anonymous" ? owner.id : null,
      name,
      slug,
    });

    const [endpoint] = await db
      .select()
      .from(endpoints)
      .where(eq(endpoints.id, id))
      .limit(1);

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}
