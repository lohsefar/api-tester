import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)))
    .limit(1);

  if (!endpoint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(endpoint);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(endpoints)
    .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)));

  return NextResponse.json({ success: true });
}

