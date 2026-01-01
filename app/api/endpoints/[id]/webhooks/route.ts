import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints, webhooks } from "@/lib/db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAuthDisabled } from "@/lib/auth-helper";
import { getAnonymousSessionId, createAnonymousSessionCookie } from "@/lib/anonymous-session";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

async function getEndpointOwner() {
  if (isAuthDisabled()) {
    let sessionId = await getAnonymousSessionId();
    if (!sessionId) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const owner = await getEndpointOwner();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    // Verify endpoint belongs to owner
    const [endpoint] = await db
      .select()
      .from(endpoints)
      .where(
        and(
          eq(endpoints.id, id),
          owner.type === "anonymous"
            ? eq(endpoints.anonymousSessionId, owner.id)
            : eq(endpoints.userId, owner.id)
        )
      )
      .limit(1);

    if (!endpoint) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let conditions = [eq(webhooks.endpointId, id)];
    
    if (method) {
      conditions.push(eq(webhooks.method, method.toUpperCase()));
    }

    let webhookList = await db
      .select()
      .from(webhooks)
      .where(and(...conditions))
      .orderBy(desc(webhooks.receivedAt));

    // Filter by search term in body if provided
    if (search) {
      webhookList = webhookList.filter((w) =>
        w.body?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(webhookList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
  }
}

