import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types/database";

export type DashboardOrderStatus = Extract<
  OrderStatus,
  "preparing" | "ready" | "out_for_delivery" | "done" | "cancelled"
>;

export type UpdateOrderStatusResponse = {
  id: string;
  status: DashboardOrderStatus;
  updated_at: string;
};

export async function updateOrderStatus(
  orderId: string,
  status: DashboardOrderStatus,
): Promise<UpdateOrderStatusResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL não configurado");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sessão inválida");
  }

  const res = await fetch(`${backendUrl}/api/dashboard/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(`Status update falhou (${res.status}): ${body?.error ?? res.statusText}`);
  }

  const json = (await res.json()) as { success: boolean; order: UpdateOrderStatusResponse };
  return json.order;
}
