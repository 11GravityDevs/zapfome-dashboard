export type Period = "today" | "7days" | "30days" | "month";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
];

export const PERIOD_ORDER_LABEL: Record<Period, string> = {
  today: "Pedidos hoje",
  "7days": "Pedidos (7 dias)",
  "30days": "Pedidos (30 dias)",
  month: "Pedidos do mês",
};
