import type { BadgeVariant } from "@/components/badge";
import type { ButtonVariant } from "@/components/button";
import type { OrderStatus } from "@/lib/types/database";

export type KanbanColumnId = "to_accept" | "preparing" | "ready" | "out_for_delivery" | "finished";

export type KanbanColumnConfig = {
  id: KanbanColumnId;
  title: string;
  stripColor: string;
  badgeVariant: BadgeVariant;
  statuses: OrderStatus[];
  actionLabel?: string;
  actionVariant?: ButtonVariant;
  faded?: boolean;
};

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: "to_accept",
    title: "Para aceitar",
    stripColor: "bg-accent-blue",
    badgeVariant: "blue",
    statuses: ["paid", "pending_delivery_payment"],
    actionLabel: "Aceitar",
    actionVariant: "blue",
  },
  {
    id: "preparing",
    title: "Em preparo",
    stripColor: "bg-accent-orange",
    badgeVariant: "orange",
    statuses: ["preparing"],
    actionLabel: "Pronto",
    actionVariant: "orange",
  },
  {
    id: "ready",
    title: "Prontos",
    stripColor: "bg-accent-green",
    badgeVariant: "green",
    statuses: ["done", "ready"],
    actionLabel: "Entrega",
    actionVariant: "green",
  },
  {
    id: "out_for_delivery",
    title: "Saiu p/ entrega",
    stripColor: "bg-accent-yellow",
    badgeVariant: "yellow",
    statuses: ["out_for_delivery"],
    actionLabel: "Finalizar",
    actionVariant: "yellow",
  },
  {
    id: "finished",
    title: "Finalizados",
    stripColor: "bg-dark-300",
    badgeVariant: "neutral",
    statuses: ["done", "out_for_delivery"],
    faded: true,
  },
];

export const PAUSE_DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "Até reativar", value: "indefinite" },
] as const satisfies readonly { label: string; value: number | "indefinite" }[];

export const ORDERS_POLL_INTERVAL_MS = 15_000;

export const READY_THRESHOLD_HOURS = 2;
