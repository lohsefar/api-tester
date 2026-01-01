import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAuthDisabled, getMockUser } from "@/lib/auth-helper";
import { getAnonymousSessionId } from "@/lib/anonymous-session";

export default async function DashboardPage() {
  const authDisabled = isAuthDisabled();
  
  const session = authDisabled ? { user: getMockUser() } : await auth();

  if (!authDisabled && (!session || !session.user?.id)) {
    redirect("/login");
  }

  // Get owner identifier
  // For anonymous sessions, we'll get it from the API call which can set cookies
  const ownerId = authDisabled 
    ? await getAnonymousSessionId() // May be null, API will create it
    : (session?.user?.id || null);

  // Only redirect to login if auth is enabled and there's no session
  if (!authDisabled && !ownerId) {
    redirect("/login");
  }
  
  // If auth is disabled but no session yet, just show the welcome screen
  // The session will be created by API calls or SessionInitializer
  if (authDisabled && !ownerId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-4">
            Create your first webhook endpoint to get started.
          </p>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to create a new endpoint.
          </p>
        </div>
      </div>
    );
  }

  // Get user's first endpoint or redirect to create one
  // ownerId is guaranteed to be non-null here due to checks above
  const userEndpoints = await db
    .select()
    .from(endpoints)
    .where(
      authDisabled
        ? eq(endpoints.anonymousSessionId, ownerId!)
        : eq(endpoints.userId, ownerId!)
    )
    .limit(1);

  if (userEndpoints.length > 0) {
    redirect(`/endpoints/${userEndpoints[0].id}`);
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
        <p className="text-muted-foreground mb-4">
          Create your first webhook endpoint to get started.
        </p>
        <p className="text-sm text-muted-foreground">
          Use the sidebar to create a new endpoint.
        </p>
      </div>
    </div>
  );
}

