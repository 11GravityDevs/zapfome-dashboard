import { createClient } from "@/lib/supabase/client";

export type OnboardingProvisionResponse = {
  tenant_id: string;
  instance_id: string;
};

type OnboardingApiError = Error & { status?: number };

export async function provisionOnboarding(): Promise<OnboardingProvisionResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const err = new Error("Sessão inválida") as OnboardingApiError;
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${backendUrl}/api/dashboard/onboarding`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const err = new Error(
      body?.error ?? `Falha ao provisionar onboarding (${res.status})`,
    ) as OnboardingApiError;
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as OnboardingProvisionResponse;
}
