import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import "server-only";

const ANONYMOUS_SESSION_COOKIE_NAME = "anonymous_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getAnonymousSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ANONYMOUS_SESSION_COOKIE_NAME)?.value || null;
}

/**
 * This function can only be called from Server Actions or Route Handlers
 * Use the /api/session/init route handler to create sessions
 */
export async function createAnonymousSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(ANONYMOUS_SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getOrCreateAnonymousSession(): Promise<string> {
  const existing = await getAnonymousSessionId();
  if (existing) {
    return existing;
  }
  // Generate new session ID but don't set cookie here
  // The caller must use a Server Action or Route Handler to set the cookie
  return nanoid(32);
}

