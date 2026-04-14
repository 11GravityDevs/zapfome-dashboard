import { formatDateTime, formatCurrency, formatPhone } from "@/lib/format";
import {
  STATUS_BADGE_MAP,
  DELIVERY_TYPE_BADGE_MAP,
  PAYMENT_BADGE_MAP,
} from "@/lib/constants/history";

export type HistoryOrder = {
  id: string;
  order_number: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string | null;
  payment_method: string | null;
  total: number;
};

export type HistoryStats = {
  total_orders: number;
  total_revenue: number;
  cancelled_count: number;
};

export function isHistoryOrder(row: unknown): row is HistoryOrder {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.order_number === "number";
}

export function isHistoryStats(row: unknown): row is HistoryStats {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return "total_orders" in r && "total_revenue" in r && "cancelled_count" in r;
}

export function buildCsv(orders: HistoryOrder[]): string {
  const header = "Pedido,Cliente,Telefone,Data,Tipo,Total,Pagamento,Status";
  const rows = orders.map((o) => {
    const status = STATUS_BADGE_MAP[o.status]?.label ?? o.status;
    const type = o.delivery_type
      ? (DELIVERY_TYPE_BADGE_MAP[o.delivery_type]?.label ?? o.delivery_type)
      : "";
    const payment = o.payment_method
      ? (PAYMENT_BADGE_MAP[o.payment_method]?.label ?? o.payment_method)
      : "";
    return [
      `#${String(o.order_number).padStart(4, "0")}`,
      o.customer_name,
      formatPhone(o.customer_phone),
      formatDateTime(o.created_at),
      type,
      formatCurrency(o.total),
      payment,
      status,
    ]
      .map(escapeCsvField)
      .join(",");
  });

  return [header, ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
