"use client";

import { useEffect, useRef, useState } from "react";
import { Pause } from "lucide-react";
import { Button } from "@/components/button";
import { KANBAN_COLUMNS, ORDERS_POLL_INTERVAL_MS, type KanbanColumnId } from "@/lib/constants/orders";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { groupOrdersByColumn, getTodayStart, type KanbanOrder } from "@/lib/utils/orders";
import { KanbanColumn } from "./kanban-column";
import { PauseModal } from "./pause-modal";

export default function PedidosPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<KanbanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);

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
      const supabase = createClient();

      const { data, error } = await supabase
        .from("order")
        .select(`
          id,
          order_number,
          status,
          created_at,
          updated_at,
          customer (name, phone),
          order_delivery_info (type),
          order_payment (payment_method, total),
          order_item (quantity, menu_item (name))
        `)
        .eq("tenant_id", tenantId)
        .in("status", ["paid", "preparing", "done", "out_for_delivery"])
        .gte("created_at", getTodayStart())
        .order("created_at", { ascending: true });

      if (cancelled || id !== fetchIdRef.current) return;

      if (error) {
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

  async function handleAccept(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "preparing" as const } : o)),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("order")
      .update({ status: "preparing", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao aceitar pedido." });
      refetchRef.current();
    }
  }

  async function handleMarkReady(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "done" as const, updated_at: new Date().toISOString() }
          : o,
      ),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("order")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao marcar pedido como pronto." });
      refetchRef.current();
    }
  }

  async function handleMarkOutForDelivery(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "out_for_delivery" as const, updated_at: new Date().toISOString() }
          : o,
      ),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("order")
      .update({ status: "out_for_delivery", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao marcar pedido como saiu p/ entrega." });
      refetchRef.current();
    }
  }

  async function handlePause(minutes: number) {
    setPauseLoading(true);
    const pausedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const supabase = createClient();

    const { error } = await supabase
      .from("tenant")
      .update({ paused_until: pausedUntil })
      .eq("id", tenantId);

    setPauseLoading(false);

    if (error) {
      showToast({ variant: "error", title: "Erro ao pausar pedidos." });
      return;
    }

    showToast({ variant: "success", title: `Pedidos pausados por ${minutes} minutos.` });
    setPauseModalOpen(false);
  }

  const columnActions: Partial<Record<KanbanColumnId, (orderId: string) => void>> = {
    to_accept: handleAccept,
    preparing: handleMarkReady,
    ready: handleMarkOutForDelivery,
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-6">
        <PageHeader lastUpdated={null} onPauseClick={() => setPauseModalOpen(true)} />
        <p className="text-sm text-font-secondary">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader lastUpdated={lastUpdated} onPauseClick={() => setPauseModalOpen(true)} />

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
            className="scrollbar-none flex min-h-0 flex-1 gap-4 overflow-x-auto pb-4"
            onScroll={handleKanbanScroll}
          >
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                config={col}
                orders={grouped[col.id]}
                onAction={columnActions[col.id]}
              />
            ))}
          </div>

          <div
            ref={scrollbarRef}
            className="fixed bottom-0 left-60 right-0 z-10 overflow-x-auto bg-bg-secondary px-8 h-8"
            onScroll={handleScrollbarScroll}
          >
            <div style={{ width: scrollContentWidth, height: 1 }} />
          </div>
        </>
      )}

      <PauseModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onConfirm={handlePause}
        loading={pauseLoading}
      />
    </div>
  );
}

function PageHeader({
  lastUpdated,
  onPauseClick,
}: {
  lastUpdated: Date | null;
  onPauseClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-font-primary">Pedidos</h1>
        {lastUpdated && (
          <span className="text-xs text-font-secondary">
            Última atualização: {formatTime(lastUpdated)}
          </span>
        )}
      </div>
      <Button
        variant="red"
        size="md"
        leadingIcon={<Pause size={16} />}
        onClick={onPauseClick}
      >
        Pausar pedidos
      </Button>
    </div>
  );
}
