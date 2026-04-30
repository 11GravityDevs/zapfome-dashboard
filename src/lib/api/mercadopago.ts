import { createClient } from "@/lib/supabase/client";

export type MercadoPagoStatus = {
  connected: boolean;
  mp_user_id: number | null;
  live_mode: boolean | null;
  scope: string | null;
  connected_at: string | null;
  token_expires_at: string | null;
};

type MercadoPagoApiError = Error & { status?: number };

export async function startMercadoPagoConnect(): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const err = new Error("Sessão inválida") as MercadoPagoApiError;
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${backendUrl}/api/dashboard/mercadopago/connect`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const err = new Error(
      body?.error ?? `Falha ao iniciar conexão (${res.status})`,
    ) as MercadoPagoApiError;
    err.status = res.status;
    throw err;
  }

  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}

export async function getMercadoPagoStatus(): Promise<MercadoPagoStatus> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const err = new Error("Sessão inválida") as MercadoPagoApiError;
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${backendUrl}/api/dashboard/mercadopago/status`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const err = new Error(
      body?.error ?? `Falha ao carregar status (${res.status})`,
    ) as MercadoPagoApiError;
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as MercadoPagoStatus;
}

export async function disconnectMercadoPago(): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const err = new Error("Sessão inválida") as MercadoPagoApiError;
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${backendUrl}/api/dashboard/mercadopago`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (res.status === 204) return;

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const err = new Error(
      body?.error ?? `Falha ao desconectar (${res.status})`,
    ) as MercadoPagoApiError;
    err.status = res.status;
    throw err;
  }
}
