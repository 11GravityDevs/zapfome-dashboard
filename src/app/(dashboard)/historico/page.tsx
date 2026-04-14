"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  DollarSign,
  ShoppingBag,
  Receipt,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/badge";
import { Spinner } from "@/components/spinner";
import { Table, THead, TBody, TR, TH, TD } from "@/components/table";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PERIOD_OPTIONS, type Period } from "@/lib/constants/dashboard";
import { getPeriodRange } from "@/lib/utils/dashboard";
import {
  STATUS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
  PAYMENT_FILTER_OPTIONS,
  STATUS_BADGE_MAP,
  DELIVERY_TYPE_BADGE_MAP,
  PAYMENT_BADGE_MAP,
  HISTORY_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/constants/history";
import {
  buildCsv,
  downloadCsv,
  isHistoryOrder,
  isHistoryStats,
  type HistoryOrder,
  type HistoryStats,
} from "@/lib/utils/history";

type SortColumn = "order_number" | "customer_name" | "created_at" | "delivery_type" | "total" | "payment_method" | "status";
type SortDirection = "asc" | "desc";

export default function HistoricoPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<Period>("7days");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  function resetPageAndSet(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "total" || column === "order_number" ? "desc" : "asc");
    }
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    const id = ++fetchIdRef.current;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const { start, end } = getPeriodRange(period);

      const searchValue = debouncedSearch.replace(/^#/, "").trim() || null;

      const [ordersRes, statsRes] = await Promise.all([
        supabase.rpc("search_orders", {
          p_tenant_id: tenantId,
          p_start: start.toISOString(),
          p_end: end.toISOString(),
          p_search: searchValue,
          p_status: statusFilter === "all" ? null : statusFilter,
          p_delivery_type: typeFilter === "all" ? null : typeFilter,
          p_payment_method: paymentFilter === "all" ? null : paymentFilter,
          p_limit: HISTORY_PAGE_SIZE,
          p_offset: (page - 1) * HISTORY_PAGE_SIZE,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
        }),
        supabase.rpc("order_history_stats", {
          p_tenant_id: tenantId,
          p_start: start.toISOString(),
          p_end: end.toISOString(),
        }),
      ]);

      if (cancelled || id !== fetchIdRef.current) return;

      if (ordersRes.error || statsRes.error) {
        showToast({
          variant: "error",
          title: "Não foi possível carregar o histórico de pedidos.",
        });
        setLoading(false);
        return;
      }

      const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const validOrders = rawOrders.filter(isHistoryOrder);
      setOrders(validOrders);

      if (rawOrders.length > 0 && "total_count" in rawOrders[0]) {
        setTotalCount(Number((rawOrders[0] as Record<string, unknown>).total_count) || 0);
      } else {
        setTotalCount(validOrders.length);
      }

      const rawStats = statsRes.data;
      if (isHistoryStats(rawStats)) {
        setStats({
          total_orders: Number(rawStats.total_orders) || 0,
          total_revenue: Number(rawStats.total_revenue) || 0,
          cancelled_count: Number(rawStats.cancelled_count) || 0,
        });
      }

      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [tenantId, period, debouncedSearch, statusFilter, typeFilter, paymentFilter, page, sortColumn, sortDirection, showToast]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const supabase = createClient();
      const { start, end } = getPeriodRange(period);
      const searchValue = debouncedSearch.replace(/^#/, "").trim() || null;

      const { data, error } = await supabase.rpc("search_orders", {
        p_tenant_id: tenantId,
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_search: searchValue,
        p_status: statusFilter === "all" ? null : statusFilter,
        p_delivery_type: typeFilter === "all" ? null : typeFilter,
        p_payment_method: paymentFilter === "all" ? null : paymentFilter,
        p_limit: 10000,
        p_offset: 0,
      });

      if (error) {
        showToast({ variant: "error", title: "Não foi possível exportar os pedidos." });
        return;
      }

      const allOrders = (Array.isArray(data) ? data : []).filter(isHistoryOrder);
      const csv = buildCsv(allOrders);
      downloadCsv(csv, "pedidos.csv");
    } finally {
      setExporting(false);
    }
  }, [tenantId, period, debouncedSearch, statusFilter, typeFilter, paymentFilter, showToast]);

  const totalPages = Math.max(1, Math.ceil(totalCount / HISTORY_PAGE_SIZE));
  const ticketMedio = stats && stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0;
  const allOrders = stats ? stats.total_orders + stats.cancelled_count : 0;
  const cancelamentoPct = allOrders > 0 ? (stats!.cancelled_count / allOrders) * 100 : 0;

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * HISTORY_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * HISTORY_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-font-primary">Histórico</h1>
        <Button
          variant="primary"
          leadingIcon={<Download size={16} />}
          loading={exporting}
          onClick={handleExport}
        >
          Exportar
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={period}
          onChange={(v) => { setPeriod(v as Period); setPage(1); }}
          options={PERIOD_OPTIONS}
          className="w-48"
          leadingIcon={<Calendar size={16} />}
        />
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Buscar pelo nome ou nº pedido"
            maxLength={100}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={<Search size={16} />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={resetPageAndSet(setStatusFilter)}
          options={STATUS_FILTER_OPTIONS}
          className="w-44"
        />
        <Select
          value={typeFilter}
          onChange={resetPageAndSet(setTypeFilter)}
          options={TYPE_FILTER_OPTIONS}
          className="w-40"
        />
        <Select
          value={paymentFilter}
          onChange={resetPageAndSet(setPaymentFilter)}
          options={PAYMENT_FILTER_OPTIONS}
          className="w-52"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatPill icon={<DollarSign size={14} />} label="Receita total" value={stats ? formatCurrency(stats.total_revenue) : "–"} />
        <StatPill icon={<ShoppingBag size={14} />} label="Pedidos" value={stats ? String(stats.total_orders) : "–"} />
        <StatPill icon={<Receipt size={14} />} label="Ticket médio" value={stats ? formatCurrency(ticketMedio) : "–"} />
        <StatPill icon={<XCircle size={14} />} label="Cancelamentos" value={stats ? `${cancelamentoPct.toFixed(1)}%` : "–"} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-card px-6 py-16 text-center shadow-soft">
          <p className="text-sm text-font-secondary">
            {debouncedSearch
              ? "Nenhum pedido encontrado."
              : "Nenhum pedido encontrado para o período selecionado."}
          </p>
        </div>
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <SortableTH column="order_number" current={sortColumn} direction={sortDirection} onSort={handleSort}>
                  Pedido #
                </SortableTH>
                <SortableTH column="customer_name" current={sortColumn} direction={sortDirection} onSort={handleSort}>
                  Cliente
                </SortableTH>
                <SortableTH column="created_at" current={sortColumn} direction={sortDirection} onSort={handleSort}>
                  Data
                </SortableTH>
                <SortableTH column="delivery_type" current={sortColumn} direction={sortDirection} onSort={handleSort} align="center">
                  Tipo
                </SortableTH>
                <SortableTH column="total" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right">
                  Total
                </SortableTH>
                <SortableTH column="payment_method" current={sortColumn} direction={sortDirection} onSort={handleSort} align="center">
                  Pagamento
                </SortableTH>
                <SortableTH column="status" current={sortColumn} direction={sortDirection} onSort={handleSort} align="center">
                  Status
                </SortableTH>
              </TR>
            </THead>
            <TBody>
              {orders.map((order) => {
                const statusBadge = STATUS_BADGE_MAP[order.status];
                const typeBadge = order.delivery_type ? DELIVERY_TYPE_BADGE_MAP[order.delivery_type] : null;
                const paymentBadge = order.payment_method ? PAYMENT_BADGE_MAP[order.payment_method] : null;

                return (
                  <TR key={order.id}>
                    <TD className="font-semibold">#{String(order.order_number).padStart(4, "0")}</TD>
                    <TD>{order.customer_name}</TD>
                    <TD>{formatDateTime(order.created_at)}</TD>
                    <TD align="center">
                      {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
                    </TD>
                    <TD align="right" className="font-semibold">{formatCurrency(order.total)}</TD>
                    <TD align="center">
                      {paymentBadge && <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>}
                    </TD>
                    <TD align="center">
                      {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>

          <div className="flex items-center justify-between">
            <span className="text-xs text-font-secondary">
              Mostrando {rangeStart}-{rangeEnd} de {totalCount} pedidos
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-2">
      <span className="text-brand-primary">{icon}</span>
      <span className="text-xs font-medium text-font-secondary">{label}</span>
      <span className="text-sm font-bold text-font-primary">{value}</span>
    </div>
  );
}

function SortableTH({
  column,
  current,
  direction,
  onSort,
  align = "left",
  children,
}: {
  column: SortColumn;
  current: SortColumn;
  direction: SortDirection;
  onSort: (col: SortColumn) => void;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}) {
  const isActive = column === current;
  return (
    <TH align={align}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "group inline-flex cursor-pointer items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors",
          isActive
            ? "text-brand-primary"
            : "text-font-secondary hover:text-brand-primary",
        )}
      >
        {children}
        {isActive ? (
          direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-40 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </TH>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center gap-1" aria-label="Paginação">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
        className="size-8 px-0"
      >
        <ChevronLeft size={16} />
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-font-secondary">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "primary" : "secondary"}
            size="sm"
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? "page" : undefined}
            className="size-8 px-0 text-xs"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Próxima página"
        className="size-8 px-0"
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}



function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
