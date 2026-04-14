"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/spinner";
import { KANBAN_COLUMNS, ORDERS_POLL_INTERVAL_MS } from "@/lib/constants/orders";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { groupOrdersByColumn, getTodayStart, type KanbanOrder } from "@/lib/utils/orders";
import { KanbanColumn } from "./kanban-column";
import { OrderDetailModal } from "./order-detail-modal";

export default function PedidosPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<KanbanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchIdRef = useRef(0);
  const refetchRef = useRef<() => void>(() => {});
  const kanbanRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [scrollContentWidth, setScrollContentWidth] = useState(0);
  const syncingScroll = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      const id = ++fetchIdRef.current;

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("order")
          .select(
            `
            id,
            order_number,
            status,
            created_at,
            updated_at,
            customer (name, phone),
            order_delivery_info (type),
            order_payment (payment_method, total),
            order_item (quantity, menu_item (name))
          `,
          )
          .eq("tenant_id", tenantId)
          .in("status", ["preparing", "ready", "done", "out_for_delivery"])
          .gte("created_at", getTodayStart())
          .order("created_at", { ascending: true });

        if (cancelled || id !== fetchIdRef.current) return;

        if (error) {
          console.error("[Pedidos] Fetch orders error:", error);
          showToast({
            variant: "error",
            title: "Não foi possível carregar os pedidos.",
          });
          setLoading(false);
          return;
        }

        setOrders((data as unknown as KanbanOrder[]) ?? []);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error("[Pedidos] Unexpected error:", err);
        if (!cancelled && id === fetchIdRef.current) {
          showToast({
            variant: "error",
            title: "Não foi possível carregar os pedidos.",
          });
          setLoading(false);
        }
      }
    }

    refetchRef.current = fetchOrders;
    fetchOrders();
    const interval = setInterval(fetchOrders, ORDERS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tenantId, showToast]);

  useEffect(() => {
    const el = kanbanRef.current;
    if (!el) return;

    function update() {
      if (el) setScrollContentWidth(el.scrollWidth);
    }

    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();

    return () => observer.disconnect();
  }, [orders]);

  function handleKanbanScroll() {
    if (syncingScroll.current) return;
    syncingScroll.current = true;
    if (scrollbarRef.current && kanbanRef.current) {
      scrollbarRef.current.scrollLeft = kanbanRef.current.scrollLeft;
    }
    syncingScroll.current = false;
  }

  function handleScrollbarScroll() {
    if (syncingScroll.current) return;
    syncingScroll.current = true;
    if (kanbanRef.current && scrollbarRef.current) {
      kanbanRef.current.scrollLeft = scrollbarRef.current.scrollLeft;
    }
    syncingScroll.current = false;
  }

  const grouped = groupOrdersByColumn(orders);

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-6">
        <PageHeader lastUpdated={null} />
        <div className="flex flex-1 h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader lastUpdated={lastUpdated} />

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-sm text-font-secondary">
            Nenhum pedido ainda hoje. Os novos pedidos aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={kanbanRef}
            className="scrollbar-none flex min-h-0 px-8 -mx-8 flex-1 gap-4 overflow-x-auto pb-4"
            onScroll={handleKanbanScroll}
          >
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                config={col}
                orders={grouped[col.id]}
                onCardClick={(order) => setSelectedOrderId(order.id)}
              />
            ))}
          </div>

          <div
            ref={scrollbarRef}
            className="fixed bottom-0 left-60 right-0 z-10 overflow-x-auto bg-bg-secondary h-8"
            onScroll={handleScrollbarScroll}
          >
            <div style={{ width: scrollContentWidth, height: 1 }} />
          </div>
        </>
      )}

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onOrderUpdated={() => refetchRef.current()}
      />
    </div>
  );
}

function PageHeader({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-bold text-font-primary">Pedidos</h1>
      {lastUpdated && (
        <span className="text-xs text-font-secondary">
          Última atualização: {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  );
}
