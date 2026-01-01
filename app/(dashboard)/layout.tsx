import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EndpointSidebar } from "@/components/endpoint-sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
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
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
