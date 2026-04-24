"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/cn";
import { formatCurrency, timeAgo } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { formatItemsPreview, type KanbanOrder } from "@/lib/utils/orders";

type OrderCardProps = {
  order: KanbanOrder;
  accentColor: string;
  faded?: boolean;
  onClick?: () => void;
  onOrderUpdated?: () => void;
};

export function OrderCard({ order, accentColor, faded, onClick, onOrderUpdated }: OrderCardProps) {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const deliveryInfo = order.order_delivery_info;
  const payment = order.order_payment;
  const { visible: visibleItems, extraCount } = formatItemsPreview(order.order_item);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const canCancel = order.status !== "done" && order.status !== "cancelled";

  async function handleConfirmCancel() {
    setCancelLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("order")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[OrderCard] Cancel error:", error);
        showToast({ variant: "error", title: "Erro ao cancelar pedido." });
        return;
      }

      showToast({ variant: "success", title: "Pedido cancelado." });
      setShowCancelConfirm(false);
      onOrderUpdated?.();
    } catch (err) {
      console.error("[OrderCard] Unexpected cancel error:", err);
      showToast({ variant: "error", title: "Erro ao cancelar pedido." });
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <>
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
        style={{ borderLeftColor: `var(--${accentColor.replace("bg-", "")})` }}
        className={cn(
          "flex cursor-pointer flex-col gap-(--spacing-md) rounded-md border border-border border-l-4 bg-bg-card p-(--spacing-md) shadow-soft transition-shadow hover:shadow-card hover:bg-bg-hover",
          faded && "opacity-[0.85] hover:shadow-soft hover:bg-bg-card cursor-default",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-font-primary">#{order.order_number}</span>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">há {timeAgo(order.created_at)}</Badge>
            {canCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelConfirm(true);
                }}
                className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-accent-red"
                aria-label={`Cancelar pedido #${order.order_number}`}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
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
              <span>
                {" "}
                + {extraCount} {extraCount === 1 ? "item" : "itens"}
              </span>
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
              {payment.payment_method === "pix" ? "Pix" : "Pagamento na entrega"}
            </Badge>
          )}
        </div>
      </div>

      <Modal
        open={showCancelConfirm}
        onClose={() => (cancelLoading ? undefined : setShowCancelConfirm(false))}
        title={`Cancelar pedido #${order.order_number}`}
        size="sm"
        locked={cancelLoading}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelConfirm(false)}
              disabled={cancelLoading}
            >
              Voltar
            </Button>
            <Button variant="red" onClick={handleConfirmCancel} loading={cancelLoading}>
              Cancelar pedido
            </Button>
          </>
        }
      >
        <p className="text-sm text-font-primary">
          Deseja mesmo cancelar esse pedido? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </>
  );
}
