import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints, webhooks } from "@/lib/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { NextRequest } from "next/server";
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const owner = await getEndpointOwner();
    const { id } = await params;

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
              // Update lastCheck before sending to avoid duplicates
              const now = new Date();
              for (const webhook of newWebhooks) {
                sendEvent({ type: "webhook", data: webhook });
              }
              lastCheck = now;
            }
          } catch (error) {
            console.error("SSE polling error:", error);
          }
        }, 1000); // Poll every second for real-time updates

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
  } catch (error: any) {
    return new Response(error.message || "Unauthorized", { status: 401 });
  }
}

