import { createClient } from "@/lib/supabase/client";

export type OnboardingResponse =
  | {
      status: "qr";
      tenant_id: string;
      instance_id: string;
      code: string;
      pairing_code: string | null;
    }
  | {
      status: "connected";
      tenant_id: string;
      instance_id: string;
    };

export type OnboardingError = Error & { status?: number };

export async function fetchOnboarding(): Promise<OnboardingResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const err = new Error("Sessão inválida") as OnboardingError;
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${backendUrl}/api/dashboard/whatsapp/connection`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const err = new Error(body?.error ?? `Falha ao conectar (${res.status})`) as OnboardingError;
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as OnboardingResponse;
}
