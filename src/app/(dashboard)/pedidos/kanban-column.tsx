"use client";

import { Badge } from "@/components/badge";
import { cn } from "@/lib/cn";
import type { KanbanColumnConfig } from "@/lib/constants/orders";
import type { KanbanOrder } from "@/lib/utils/orders";
import { OrderCard } from "./order-card";

type KanbanColumnProps = {
  config: KanbanColumnConfig;
  orders: KanbanOrder[];
  onCardClick?: (order: KanbanOrder) => void;
};

export function KanbanColumn({ config, orders, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col">
      <div className={cn("h-[5px] rounded-t-md", config.stripColor)} />

      <div className="flex items-center gap-2 border-x bg-bg-card border-b border-border shadow-soft px-(--spacing-md) py-3">
        <span className="text-sm font-bold text-font-primary">{config.title}</span>
        <Badge variant={config.badgeVariant}>{orders.length}</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto border-x border-b border-border rounded-b-md bg-bg-secondary p-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            accentColor={config.stripColor}
            faded={config.faded}
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
