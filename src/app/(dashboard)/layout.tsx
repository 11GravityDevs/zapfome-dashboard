import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TenantProvider } from "@/contexts/tenant-context";
import { getCurrentTenant } from "@/lib/tenant";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const resolution = await getCurrentTenant();

  if (resolution.status === "unauthenticated") {
    redirect("/login");
  }

  if (resolution.status === "no_tenant") {
    redirect("/onboarding");
  }

  const { tenant, tenantId, tenantUser } = resolution;

  return (
    <TenantProvider value={{ tenant, tenantId, tenantUser }}>
      <div className="min-h-screen bg-bg-secondary">
        <Sidebar />
        <div className="ml-60 flex min-h-screen flex-col">
          <TopBar />
          <main className="flex min-h-0 flex-1 flex-col px-8 py-6">{children}</main>
        </div>
      </div>
    </TenantProvider>
  );
}
