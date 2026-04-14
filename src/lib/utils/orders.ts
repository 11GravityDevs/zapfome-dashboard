import { startOfDay } from "date-fns";
import { READY_THRESHOLD_HOURS, type KanbanColumnId } from "@/lib/constants/orders";
import type { DeliveryType, OrderStatus, PaymentMethod } from "@/lib/types/database";

export type KanbanOrder = {
  id: string;
  order_number: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  customer: { name: string; phone: string } | null;
  order_delivery_info: { type: DeliveryType } | null;
  order_payment: { payment_method: PaymentMethod; total: number } | null;
  order_item: { quantity: number; menu_item: { name: string } | null }[] | null;
};

export type GroupedOrders = Record<KanbanColumnId, KanbanOrder[]>;

export function groupOrdersByColumn(orders: KanbanOrder[]): GroupedOrders {
  const now = Date.now();
  const thresholdMs = READY_THRESHOLD_HOURS * 60 * 60 * 1000;

  const grouped: GroupedOrders = {
    preparing: [],
    ready: [],
    out_for_delivery: [],
    finished: [],
  };

  for (const order of orders) {
    if (order.status === "preparing") {
      grouped.preparing.push(order);
    } else if (order.status === "out_for_delivery") {
      const updatedAt = new Date(order.updated_at).getTime();
      if (now - updatedAt < thresholdMs) {
        grouped.out_for_delivery.push(order);
      } else {
        grouped.finished.push(order);
      }
    } else if (order.status === "done" || order.status === "ready") {
      const updatedAt = new Date(order.updated_at).getTime();
      if (now - updatedAt < thresholdMs) {
        grouped.ready.push(order);
      } else {
        grouped.finished.push(order);
      }
    }
  }

  return grouped;
}

export function getTodayStart(): string {
  return startOfDay(new Date()).toISOString();
}

export function formatFlavorText(
  flavors: { fraction: number; menu_item_flavor: { name: string } | null }[],
): string | null {
  if (flavors.length === 0) return null;
  return flavors
    .map((f) => {
      const name = f.menu_item_flavor?.name ?? "Sabor";
      if (f.fraction < 1) {
        const display = f.fraction === 0.5 ? "1/2" : `${Math.round(f.fraction * 100)}%`;
        return `${display} ${name}`;
      }
      return name;
    })
    .join(", ");
}

export function getWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

export function formatEstimatedTime(
  settings: { pickup_time_min: number; pickup_time_max: number; delivery_time_min: number; delivery_time_max: number },
  deliveryType: DeliveryType,
): string {
  if (deliveryType === "delivery") {
    return `${settings.delivery_time_min} - ${settings.delivery_time_max} min`;
  }
  return `${settings.pickup_time_min} - ${settings.pickup_time_max} min`;
}

export function formatItemsPreview(
  items: { quantity: number; menu_item: { name: string } | null }[] | null,
): { visible: string[]; extraCount: number } {
  if (!items || items.length === 0) return { visible: [], extraCount: 0 };

  const maxVisible = 2;
  const visible = items
    .slice(0, maxVisible)
    .map((item) => `${item.quantity}x ${item.menu_item?.name ?? "Item"}`);
  const extraCount = Math.max(0, items.length - maxVisible);

  return { visible, extraCount };
}
