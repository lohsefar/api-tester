/**
 * Helper functions for authentication
 * Supports disabling auth via DISABLE_AUTH environment variable
 */

export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

export function getMockUser() {
  return {
    id: "mock-user-id",
    email: "anonymous@localhost",
    name: "Anonymous User",
    image: null,
  };
}

/**
 * Get the identifier to use for endpoint ownership
 * Returns anonymous session ID if auth is disabled, otherwise user ID
 */
export async function getEndpointOwnerId(): Promise<string> {
  if (isAuthDisabled()) {
    const { getOrCreateAnonymousSession } = await import("./anonymous-session");
    return getOrCreateAnonymousSession();
  }
  // This should only be called when auth is enabled
  throw new Error("getEndpointOwnerId should not be called when auth is enabled");
}

