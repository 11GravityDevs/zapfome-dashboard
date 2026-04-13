"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { startOfMonth, subDays, endOfDay, subMonths } from "date-fns";
import { Card } from "@/components/card";
import { KpiCard } from "@/components/kpi-card";
import { Select } from "@/components/select";
import { Spinner } from "@/components/spinner";
import { PERIOD_OPTIONS, PERIOD_ORDER_LABEL, type Period } from "@/lib/constants/dashboard";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import {
  calcTrend,
  getPeriodLabel,
  getPeriodRange,
  getPrevPeriodRange,
  isTopProduct,
  type TopProduct,
} from "@/lib/utils/dashboard";

type KpiData = {
  orderCount: number;
  revenue: number;
  avgTicket: number;
  monthlyRevenue: number;
  prevOrderCount: number;
  prevRevenue: number;
  prevMonthlyRevenue: number;
};

export default function DashboardHomePage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<Period>("today");
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdRef = useRef(0);

  function handlePeriodChange(newPeriod: Period) {
    setPeriod(newPeriod);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    const id = ++fetchIdRef.current;

    async function fetchData() {
      const supabase = createClient();

      const { start, end } = getPeriodRange(period);
      const { start: prevStart, end: prevEnd } = getPrevPeriodRange(period);
      
      const now = new Date();
      const monthStart = startOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfDay(subDays(monthStart, 1));

      const [currentRes, prevRes, monthRes, prevMonthRes, productsRes] = await Promise.all([
        supabase.rpc("dashboard_kpis", {
          p_tenant_id: tenantId,
          p_start: start.toISOString(),
          p_end: end.toISOString(),
        }),
        supabase.rpc("dashboard_kpis", {
          p_tenant_id: tenantId,
          p_start: prevStart.toISOString(),
          p_end: prevEnd.toISOString(),
        }),
        supabase.rpc("dashboard_kpis", {
          p_tenant_id: tenantId,
          p_start: monthStart.toISOString(),
          p_end: now.toISOString(),
        }),
        supabase.rpc("dashboard_kpis", {
          p_tenant_id: tenantId,
          p_start: prevMonthStart.toISOString(),
          p_end: prevMonthEnd.toISOString(),
        }),
        supabase.rpc("dashboard_top_products", {
          p_tenant_id: tenantId,
          p_start: start.toISOString(),
          p_end: end.toISOString(),
          p_limit: 10,
        }),
      ]);

      if (cancelled || id !== fetchIdRef.current) return;

      const hasError =
        currentRes.error || prevRes.error || monthRes.error || prevMonthRes.error || productsRes.error;

      if (hasError) {
        showToast({
          variant: "error",
          title: "Não foi possível carregar os dados do dashboard.",
        });
        setLoading(false);
        return;
      }

      const cur = currentRes.data ?? { order_count: 0, revenue: 0 };
      const prev = prevRes.data ?? { order_count: 0, revenue: 0 };
      const month = monthRes.data ?? { order_count: 0, revenue: 0 };
      const prevMonth = prevMonthRes.data ?? { order_count: 0, revenue: 0 };

      const orderCount = Number(cur.order_count) || 0;
      const revenue = Number(cur.revenue) || 0;

      setKpis({
        orderCount,
        revenue,
        avgTicket: orderCount > 0 ? revenue / orderCount : 0,
        monthlyRevenue: Number(month.revenue) || 0,
        prevOrderCount: Number(prev.order_count) || 0,
        prevRevenue: Number(prev.revenue) || 0,
        prevMonthlyRevenue: Number(prevMonth.revenue) || 0,
      });

      const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      setTopProducts(rawProducts.filter(isTopProduct));
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [tenantId, period, showToast]);

  const orderTrend = kpis ? calcTrend(kpis.orderCount, kpis.prevOrderCount) : null;
  const revenueTrend = kpis ? calcTrend(kpis.revenue, kpis.prevRevenue) : null;
  const avgPrevTicket =
    kpis && kpis.prevOrderCount > 0 ? kpis.prevRevenue / kpis.prevOrderCount : 0;
  const ticketTrend = kpis ? calcTrend(kpis.avgTicket, avgPrevTicket) : null;
  const monthTrend = kpis ? calcTrend(kpis.monthlyRevenue, kpis.prevMonthlyRevenue) : null;

  const maxSold = topProducts.length > 0 ? topProducts[0].total_sold : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-font-primary">Início</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-font-secondary">Período:</span>
          <Select
            value={period}
            onChange={(v) => handlePeriodChange(v as Period)}
            options={PERIOD_OPTIONS}
            className="w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<ShoppingBag size={20} />}
          label={PERIOD_ORDER_LABEL[period]}
          value={loading ? "–" : kpis?.orderCount ?? 0}
          trend={orderTrend !== null ? { value: orderTrend } : undefined}
        />
        <KpiCard
          icon={<DollarSign size={20} />}
          label="Faturamento Bruto"
          value={loading ? "–" : formatCurrency(kpis?.revenue ?? 0)}
          trend={revenueTrend !== null ? { value: revenueTrend } : undefined}
        />
        <KpiCard
          icon={<Receipt size={20} />}
          label="Ticket médio"
          value={loading ? "–" : formatCurrency(kpis?.avgTicket ?? 0)}
          trend={ticketTrend !== null ? { value: ticketTrend } : undefined}
        />
        <KpiCard
          icon={<TrendingUp size={20} />}
          label="Receita mensal"
          value={loading ? "–" : formatCurrency(kpis?.monthlyRevenue ?? 0)}
          trend={monthTrend !== null ? { value: monthTrend } : undefined}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-font-primary">
            Top 10 produtos mais vendidos
          </h2>
          <p className="text-sm font-normal text-font-secondary">
            Período: {getPeriodLabel(period)}
          </p>
        </div>

        {loading ? (
          <Card>
            <div className="flex items-center min-h-40 justify-center py-8">
              <Spinner size="lg" />
            </div>
          </Card>
        ) : topProducts.length === 0 ? (
          <Card>
            <p className="text-sm text-font-secondary">
              Nenhum produto vendido neste período.
            </p>
          </Card>
        ) : (
          <Card>
            <div className="flex flex-col gap-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-right text-sm font-medium text-font-secondary">
                    {index + 1}
                  </span>
                  <span className="w-40 shrink-0 truncate text-sm font-normal text-font-primary">
                    {product.name}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded-sm bg-brand-primary"
                      style={{
                        width: `${maxSold > 0 ? (product.total_sold / maxSold) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-font-primary">
                    {product.total_sold}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
