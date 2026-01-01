import { db } from "@/lib/db";
import { endpoints, webhooks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleWebhook(request, params, "POST");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleWebhook(request, params, "GET");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleWebhook(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleWebhook(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleWebhook(request, params, "DELETE");
}

async function handleWebhook(
  request: NextRequest,
  params: Promise<{ slug: string }>,
  method: string
) {
  const { slug } = await params;

  // Find endpoint by slug
  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.slug, slug))
    .limit(1);

  if (!endpoint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get request data
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  const url = new URL(request.url);
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  let body: string | null = null;
  try {
    body = await request.text();
  } catch (e) {
    // Body might be empty or not readable
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             "unknown";

  // Store webhook
  await db.insert(webhooks).values({
    id: nanoid(),
    endpointId: endpoint.id,
    method,
    headers: headersObj,
    body,
    queryParams,
    ip,
  });

  return NextResponse.json({ received: true }, { status: 200 });
}

