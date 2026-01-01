import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints, webhooks } from "@/lib/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Verify endpoint belongs to user
  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(and(eq(endpoints.id, id), eq(endpoints.userId, session.user.id)))
    .limit(1);

  if (!endpoint) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection message
      sendEvent({ type: "connected" });

      // Poll for new webhooks
      let lastCheck = new Date();
      const pollInterval = setInterval(async () => {
        try {
          const newWebhooks = await db
            .select()
            .from(webhooks)
            .where(
              and(
                eq(webhooks.endpointId, id),
                gt(webhooks.receivedAt, lastCheck)
              )
            )
            .orderBy(desc(webhooks.receivedAt));

          if (newWebhooks.length > 0) {
            for (const webhook of newWebhooks) {
              sendEvent({ type: "webhook", data: webhook });
            }
            lastCheck = new Date();
          }
        } catch (error) {
          console.error("SSE polling error:", error);
        }
      }, 1000); // Poll every second

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

