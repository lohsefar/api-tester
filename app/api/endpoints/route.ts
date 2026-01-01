import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEndpoints = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.userId, session.user.id))
    .orderBy(endpoints.createdAt);

  return NextResponse.json(userEndpoints);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = nanoid(12);
  const id = nanoid();

  await db.insert(endpoints).values({
    id,
    userId: session.user.id,
    name,
    slug,
  });

  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.id, id))
    .limit(1);

  return NextResponse.json(endpoint, { status: 201 });
}

