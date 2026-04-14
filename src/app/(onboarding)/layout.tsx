import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { getCurrentTenant } from "@/lib/tenant";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const resolution = await getCurrentTenant();

  if (resolution.status === "unauthenticated") {
    redirect("/login");
  }

  if (resolution.status !== "no_tenant") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-(--spacing-md) py-(--spacing-xl)">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <Logo imageSize={64} fontSize={20} />
        <div className="mt-(--spacing-xl) w-full">{children}</div>
      </div>
    </div>
  );
}
