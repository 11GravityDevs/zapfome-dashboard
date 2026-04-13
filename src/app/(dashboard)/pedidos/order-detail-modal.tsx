"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/badge";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/spinner";
import { Table, THead, TBody, TR, TH, TD } from "@/components/table";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency, formatPhone } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryType, OrderStatus, PaymentMethod } from "@/lib/types/database";
import { formatEstimatedTime, formatFlavorText, getWhatsAppLink } from "@/lib/utils/orders";

type OrderDetailItem = {
  id: string;
  quantity: number;
  unit_price: number;
  observation: string | null;
  menu_item: { name: string } | null;
  order_item_flavor: {
    fraction: number;
    menu_item_flavor: { name: string } | null;
  }[];
};

type OrderDetail = {
  id: string;
  order_number: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  customer: { name: string; phone: string } | null;
  order_delivery_info: {
    type: DeliveryType;
    delivery_address: string | null;
    delivery_neighborhood: string | null;
    delivery_city: string | null;
  } | null;
  order_payment: {
    payment_method: PaymentMethod;
    subtotal: number;
    delivery_fee: number;
    total: number;
    paid_at: string | null;
  } | null;
  order_item: OrderDetailItem[];
};

type TenantTimeSettings = {
  pickup_time_min: number;
  pickup_time_max: number;
  delivery_time_min: number;
  delivery_time_max: number;
};

type OrderDetailModalProps = {
  orderId: string | null;
  onClose: () => void;
  onOrderUpdated: () => void;
};

const STATUS_BADGE: Partial<Record<OrderStatus, { label: string; variant: BadgeVariant }>> = {
  paid: { label: "Novo", variant: "blue" },
  preparing: { label: "Em preparo", variant: "orange" },
  done: { label: "Pronto", variant: "green" },
  out_for_delivery: { label: "Saiu p/ entrega", variant: "yellow" },
  cancelled: { label: "Cancelado", variant: "red" },
};

export function OrderDetailModal({ orderId, onClose, onOrderUpdated }: OrderDetailModalProps) {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [timeSettings, setTimeSettings] = useState<TenantTimeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const refetchRef = useRef<() => void>(() => { });

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function fetchOrder() {
      setOrder(null);
      setConfirmCancel(false);
      setLoading(true);
      const supabase = createClient();

      const [orderRes, settingsRes] = await Promise.all([
        supabase
          .from("order")
          .select(`
            id,
            order_number,
            status,
            created_at,
            updated_at,
            customer (name, phone),
            order_delivery_info (type, delivery_address, delivery_neighborhood, delivery_city),
            order_payment (payment_method, subtotal, delivery_fee, total, paid_at),
            order_item (
              id,
              quantity,
              unit_price,
              observation,
              menu_item (name),
              order_item_flavor (
                fraction,
                menu_item_flavor (name)
              )
            )
          `)
          .eq("id", orderId)
          .eq("tenant_id", tenantId)
          .single(),
        supabase
          .from("tenant_settings")
          .select("pickup_time_min, pickup_time_max, delivery_time_min, delivery_time_max")
          .eq("tenant_id", tenantId)
          .single(),
      ]);

      if (cancelled) return;

      if (orderRes.error) {
        showToast({ variant: "error", title: "Não foi possível carregar o pedido." });
        setLoading(false);
        return;
      }

      setOrder(orderRes.data as unknown as OrderDetail);
      if (!settingsRes.error) {
        setTimeSettings(settingsRes.data as TenantTimeSettings);
      }
      setLoading(false);
    }

    refetchRef.current = fetchOrder;
    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, tenantId, showToast]);

  async function handleStatusUpdate(newStatus: OrderStatus, successMessage: string) {
    if (!order) return;
    setActionLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("order")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("tenant_id", tenantId);

    setActionLoading(false);

    if (error) {
      showToast({ variant: "error", title: "Erro ao atualizar pedido." });
      return;
    }

    showToast({ variant: "success", title: successMessage });
    onOrderUpdated();
    refetchRef.current();
  }

  function handleAccept() {
    handleStatusUpdate("preparing", "Pedido aceito!");
  }

  function handleMarkReady() {
    handleStatusUpdate("done", "Pedido marcado como pronto!");
  }

  function handleCancel() {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    handleStatusUpdate("cancelled", "Pedido cancelado.");
    setConfirmCancel(false);
  }

  const isDelivery = order?.order_delivery_info?.type === "delivery";
  const payment = order?.order_payment;
  const statusBadge = order ? STATUS_BADGE[order.status] : null;
  const estimatedTime =
    timeSettings && order?.order_delivery_info
      ? formatEstimatedTime(timeSettings, order.order_delivery_info.type)
      : null;

  const footerContent = order ? (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="md" className="flex-1" leadingIcon={<Printer size={16} />} disabled>
          Reimprimir cozinha
        </Button>
        <Button variant="secondary" size="md" className="flex-1" leadingIcon={<Printer size={16} />} disabled>
          Reimprimir balcão
        </Button>
      </div>

      {order.status === "paid" && (
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            loading={actionLoading && confirmCancel}
          >
            {confirmCancel ? "Sim, cancelar" : "Cancelar pedido"}
          </Button>
          {confirmCancel && (
            <Button variant="secondary" size="md" onClick={() => setConfirmCancel(false)}>
              Não
            </Button>
          )}
          {!confirmCancel && (
            <Button
              variant="green"
              size="md"
              onClick={handleAccept}
              loading={actionLoading && !confirmCancel}
            >
              Aceitar pedido
            </Button>
          )}
        </div>
      )}

      {order.status === "preparing" && (
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            loading={actionLoading && confirmCancel}
          >
            {confirmCancel ? "Sim, cancelar" : "Cancelar pedido"}
          </Button>
          {confirmCancel && (
            <Button variant="secondary" size="md" onClick={() => setConfirmCancel(false)}>
              Não
            </Button>
          )}
          {!confirmCancel && (
            <Button
              variant="primary"
              size="md"
              onClick={handleMarkReady}
              loading={actionLoading && !confirmCancel}
            >
              Marcar como pronto
            </Button>
          )}
        </div>
      )}

      {order.status === "cancelled" && (
        <p className="text-right text-sm font-semibold text-accent-red">Pedido cancelado</p>
      )}
    </div>
  ) : null;

  const titleContent = order ? (
    <span className="flex items-center gap-3">
      Pedido #{order.order_number}
      {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
    </span>
  ) : (
    "Carregando…"
  );

  return (
    <Modal
      open={!!orderId}
      onClose={onClose}
      title={titleContent}
      footer={footerContent}
    >
      {loading || !order ? (
        <div className="flex min-h-80 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-font-primary">
                {order.customer?.name ?? "Cliente"}
              </span>
              {order.order_delivery_info && (
                <Badge variant={isDelivery ? "blue" : "neutral"}>
                  {isDelivery ? "Entrega" : "Retirada"}
                </Badge>
              )}
              {payment && (
                <Badge variant={payment.payment_method === "pix" ? "green" : "neutral"}>
                  {payment.payment_method === "pix" ? "Pix" : "Na entrega"}
                </Badge>
              )}
            </div>
            {order.customer?.phone && (
              <a href={getWhatsAppLink(order.customer.phone)}
                target="_blank"
                rel="noopener noreferrer" className="flex items-center gap-2">
                <Image src="/whatsapp-icon.svg" alt="" width={20} height={20} className="text-whatsapp-green" />
                <span
                  className="text-sm text-font-secondary hover:text-green-500 transition-all"
                >
                  {formatPhone(order.customer.phone)}
                </span>
              </a>
            )}
          </section>

          <section>
            <Table>
              <THead>
                <TR>
                  <TH>Item</TH>
                  <TH>Sabores / Observação</TH>
                  <TH align="center">Qtd</TH>
                  <TH align="right">Preço</TH>
                </TR>
              </THead>
              <TBody>
                {order.order_item.length === 0 ? (
                  <TR>
                    <TD colSpan={4} align="center">
                      Nenhum item neste pedido.
                    </TD>
                  </TR>
                ) : (
                  order.order_item.map((item) => {
                    const flavorText = formatFlavorText(item.order_item_flavor);
                    const detail = flavorText ?? item.observation;
                    return (
                      <TR key={item.id}>
                        <TD className="font-semibold">
                          {item.menu_item?.name ?? "Item"}
                        </TD>
                        <TD className="text-xs text-font-secondary">
                          {detail ?? "—"}
                        </TD>
                        <TD align="center">{item.quantity}</TD>
                        <TD align="right">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </TD>
                      </TR>
                    );
                  })
                )}
              </TBody>
            </Table>

            {payment && (
              <p className="mt-4 text-right text-sm font-semibold text-font-primary">
                Itens {formatCurrency(payment.subtotal)}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-1">
            {isDelivery && order.order_delivery_info?.delivery_address ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-font-secondary">Endereço de entrega</p>
                  <p className="text-sm text-font-primary">
                    {[
                      order.order_delivery_info.delivery_address,
                      order.order_delivery_info.delivery_neighborhood,
                      order.order_delivery_info.delivery_city,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                </div>

                {payment && payment.delivery_fee > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-font-secondary">
                      Taxa de entrega:
                    </p>
                    <p className="text-sm text-font-primary">
                      {formatCurrency(payment.total)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-font-secondary">Tipo de entrega</p>
                <p className="text-sm text-font-primary">Retirada no local</p>
              </>
            )}
          </section>

          {estimatedTime && (
            <section className="flex flex-col gap-1">
              <p className="text-sm text-font-secondary">Tempo estimado</p>
              <p className="text-sm text-font-primary">{estimatedTime}</p>
            </section>
          )}

          {payment && (
            <section className="flex flex-col gap-1">
              <p className="text-sm text-font-secondary">Pagamento</p>

              <p className="text-sm text-font-primary">
                Subtotal: {formatCurrency(payment.subtotal)}
              </p>

              {isDelivery && payment.delivery_fee > 0 && (
                <p className="text-sm text-font-primary">
                  Taxa de entrega: {formatCurrency(payment.delivery_fee)}
                </p>
              )}

              <p className="text-base font-bold mt-2 text-font-primary">
                Total: {formatCurrency(payment.total)}
              </p>
            </section>
          )}

          {!payment && (
            <p className="text-sm font-semibold text-accent-red">Pagamento não registrado</p>
          )}
        </div>
      )}
    </Modal>
  );
}
