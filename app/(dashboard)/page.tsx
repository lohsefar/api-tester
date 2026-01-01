import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpoints } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's first endpoint or redirect to create one
  const userEndpoints = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.userId, session.user.id))
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

