import type { BadgeVariant } from "@/components/badge";
import type { SelectOption } from "@/components/select";

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "Todos os status" },
  { value: "confirmed", label: "Confirmado" },
  { value: "pending_delivery_payment", label: "Pgto. pendente" },
  { value: "paid", label: "Pago" },
  { value: "preparing", label: "Em preparo" },
  { value: "ready", label: "Pronto" },
  { value: "done", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
];

export const TYPE_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "delivery", label: "Entrega" },
  { value: "pickup", label: "Retirada" },
];

export const PAYMENT_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", label: "Todos os pagamentos" },
  { value: "pix", label: "Pix" },
  { value: "on_delivery", label: "Na entrega" },
];

export const STATUS_BADGE_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: "Confirmado", variant: "blue" },
  pending_delivery_payment: { label: "Pgto. pendente", variant: "yellow" },
  paid: { label: "Pago", variant: "green" },
  preparing: { label: "Em preparo", variant: "orange" },
  ready: { label: "Pronto", variant: "green" },
  done: { label: "Finalizado", variant: "green" },
  cancelled: { label: "Cancelado", variant: "red" },
  payment_expired: { label: "Expirado", variant: "red" },
  out_for_delivery: { label: "Saiu p/ entrega", variant: "yellow" },
};

export const DELIVERY_TYPE_BADGE_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  delivery: { label: "Entrega", variant: "blue" },
  pickup: { label: "Retirada", variant: "neutral" },
};

export const PAYMENT_BADGE_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  pix: { label: "Pix", variant: "green" },
  on_delivery: { label: "Na entrega", variant: "neutral" },
};

export const HISTORY_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_MS = 300;
