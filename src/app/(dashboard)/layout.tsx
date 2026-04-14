import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
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

  if (resolution.status === "inactive") {
    return (
      <FullPageMessage
        title="Conta desativada"
        body="Sua conta está desativada. Entre em contato com o suporte da Zapfome para reativar o acesso."
      />
    );
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

function FullPageMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-(--spacing-md)">
      <div className="flex w-full max-w-md flex-col items-center">
        <Logo imageSize={80} fontSize={24} />

        <div className="mt-(--spacing-xl) w-full rounded-xl border border-border bg-bg-card p-(--spacing-xl) text-center shadow-card">
          <h1 className="text-xl font-bold text-font-primary">{title}</h1>
          <p className="mt-(--spacing-sm) text-sm text-font-secondary">{body}</p>
        </div>
      </div>
    </div>
  );
}
