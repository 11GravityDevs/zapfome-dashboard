"use client";

import { Badge } from "@/components/badge";
import { cn } from "@/lib/cn";
import type { KanbanColumnConfig } from "@/lib/constants/orders";
import type { KanbanOrder } from "@/lib/utils/orders";
import { OrderCard } from "./order-card";

type KanbanColumnProps = {
  config: KanbanColumnConfig;
  orders: KanbanOrder[];
  onAction?: (orderId: string) => void;
  onCardClick?: (order: KanbanOrder) => void;
};

export function KanbanColumn({ config, orders, onAction, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col">
      <div className={cn("h-2 rounded-t-md", config.stripColor)} />

      <div className="flex items-center gap-2 border-x border-border bg-bg-card px-(--spacing-md) py-3">
        <span className="text-sm font-bold text-font-primary">{config.title}</span>
        <Badge variant={config.badgeVariant}>{orders.length}</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto border-x border-b border-border rounded-b-md bg-bg-secondary p-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            actionLabel={config.actionLabel}
            actionVariant={config.actionVariant}
            faded={config.faded}
            onAction={() => onAction?.(order.id)}
            onClick={() => onCardClick?.(order)}
          />
        ))}

        {orders.length === 0 && (
          <p className="py-8 text-center text-xs text-font-secondary">
            Nenhum pedido
          </p>
        )}
      </div>
    </div>
  );
}
