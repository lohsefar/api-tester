import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EndpointSidebar } from "@/components/endpoint-sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAuthDisabled, getMockUser } from "@/lib/auth-helper";
import { getAnonymousSessionId } from "@/lib/anonymous-session";
import Image from "next/image";
import { SessionInitializer } from "@/components/session-initializer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authDisabled = isAuthDisabled();
  
  // Check if anonymous session exists (but don't create it here - use client component)
  let hasAnonymousSession = false;
  if (authDisabled) {
    const sessionId = await getAnonymousSessionId();
    hasAnonymousSession = !!sessionId;
  }
  
  const session = authDisabled ? { user: getMockUser() } : await auth();

  if (!authDisabled && !session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      {authDisabled && !hasAnonymousSession && <SessionInitializer />}
      <EndpointSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SauerBridge"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-lg font-semibold">Webhook Tester</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!authDisabled && session && (
              <>
                <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                <SignOutButton />
              </>
            )}
            {authDisabled && (
              <span className="text-sm text-muted-foreground">Auth Disabled</span>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
