"use client";

import { Badge } from "@/components/badge";
import { Button, type ButtonVariant } from "@/components/button";
import { cn } from "@/lib/cn";
import { formatCurrency, timeAgo } from "@/lib/format";
import { formatItemsPreview, type KanbanOrder } from "@/lib/utils/orders";

type OrderCardProps = {
  order: KanbanOrder;
  actionLabel?: string;
  actionVariant?: ButtonVariant;
  faded?: boolean;
  onAction?: () => void;
  onClick?: () => void;
};

export function OrderCard({
  order,
  actionLabel,
  actionVariant,
  faded,
  onAction,
  onClick,
}: OrderCardProps) {
  const deliveryInfo = order.order_delivery_info;
  const payment = order.order_payment;
  const { visible: visibleItems, extraCount } = formatItemsPreview(order.order_item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-(--spacing-md) rounded-md border border-border bg-bg-card p-(--spacing-md) shadow-soft transition-shadow hover:shadow-card hover:bg-bg-hover",
        faded && "opacity-[0.85] hover:shadow-soft hover:bg-bg-card cursor-default",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-font-primary">
          #{order.order_number}
        </span>
        <Badge variant="neutral">{timeAgo(order.created_at)}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="truncate text-sm font-semibold text-font-primary">
          {order.customer?.name ?? "Cliente"}
        </span>
        {payment && (
          <span className="text-base font-bold text-font-primary">
            {formatCurrency(payment.total)}
          </span>
        )}
      </div>

      {visibleItems.length > 0 && (
        <div className="text-xs text-font-secondary">
          {visibleItems.map((item, i) => (
            <span key={i}>
              {item}
              {i < visibleItems.length - 1 && ", "}
            </span>
          ))}
          {extraCount > 0 && (
            <span> + {extraCount} {extraCount === 1 ? "item" : "itens"}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {deliveryInfo && (
          <Badge variant={deliveryInfo.type === "delivery" ? "blue" : "neutral"}>
            {deliveryInfo.type === "delivery" ? "Entrega" : "Retirada"}
          </Badge>
        )}
        {payment && (
          <Badge variant={payment.payment_method === "pix" ? "green" : "neutral"}>
            {payment.payment_method === "pix" ? "Pix" : "Na entrega"}
          </Badge>
        )}
      </div>

      {actionLabel && actionVariant && !faded && (
        <div className="flex justify-end">
          <Button
            variant={actionVariant}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
