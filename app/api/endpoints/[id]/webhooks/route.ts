import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints, webhooks } from "@/lib/db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const method = searchParams.get("method");
  const search = searchParams.get("search");

  // Verify endpoint belongs to user
  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)))
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
}

