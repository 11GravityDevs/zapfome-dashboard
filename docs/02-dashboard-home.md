# Screen 2 — Dashboard Home (Início)

## Overview

The landing page after login. Gives the restaurant owner a quick snapshot of today's performance: key metrics and the most popular products. This is a read-only, informational screen — no mutations.

**Screenshot**: `zapfome-screens/Screen 2 - Dashboard Home.webp`

---

## Route

`/` — the root page inside the `(dashboard)` route group.

---

## Layout

### Period Filter

Top of the page, right-aligned:
- Label: "Período:"
- Dropdown/select with options: `Hoje`, `Últimos 7 dias`, `Últimos 30 dias`, `Este mês`
- Default: `Hoje`
- Changing the period re-fetches all data on the page

### KPI Cards Row

Four `KpiCard` components in a horizontal row (4 columns at desktop, 2 on tablet, 1 on mobile):

| # | Label | Icon (Lucide) | Value example | Trend |
|---|---|---|---|---|
| 1 | Pedidos hoje | `ShoppingBag` | 34 | +16% (green up arrow) |
| 2 | Faturamento | `DollarSign` | R$ 2.847,50 | -15.2% (red down arrow) |
| 3 | Ticket médio | `Receipt` | R$ 83,75 | -2.1% (red down arrow) |
| 4 | Receita mensal | `TrendingUp` | R$ 12.450,00 | +12% (green up arrow) |

**Trend calculation**: Compare the current period value against the previous equivalent period:
- "Hoje" compares to yesterday
- "Últimos 7 dias" compares to the 7 days before that
- "Últimos 30 dias" / "Este mês" compares to the previous 30 days / month

Trend arrow: green `ArrowUp` if positive, red `ArrowDown` if negative. Display as percentage with one decimal.

### Top 10 Products Section

**Header**: "Top 10 produtos mais vendidos" (18/600) with sub-label "Período: Hoje" (14/400, `--font-secondary`)

**Chart**: Horizontal bar chart:
- 10 rows, numbered 1–10
- Each row: rank number, product name (14/400), horizontal orange bar (`--brand-primary`), quantity count on the right
- Bar width is proportional to the top item's count (item 1 = 100% width)
- No external charting library needed — simple `<div>` bars with percentage widths

---

## Data Requirements

### Queries

All queries are scoped to the authenticated user's `tenant_id`.

**1. KPI: Order count for the period**

```sql
SELECT COUNT(*) as order_count
FROM "order"
WHERE tenant_id = :tenant_id
  AND status NOT IN ('idle', 'pending_cart', 'pending_address', 'cancelled', 'payment_expired')
  AND created_at >= :period_start
  AND created_at < :period_end
```

**2. KPI: Revenue for the period**

```sql
SELECT COALESCE(SUM(op.total), 0) as revenue
FROM order_payment op
JOIN "order" o ON o.id = op.order_id
WHERE o.tenant_id = :tenant_id
  AND o.status NOT IN ('idle', 'pending_cart', 'pending_address', 'cancelled', 'payment_expired')
  AND o.created_at >= :period_start
  AND o.created_at < :period_end
```

**3. KPI: Average ticket**

Derived: `revenue / order_count`. Show `R$ 0,00` if no orders.

**4. KPI: Monthly revenue**

Same as query 2 but with `period_start` = first day of current month, `period_end` = now.

**5. KPI: Previous period values (for trends)**

Repeat queries 1, 2, 4 with the previous period's date range.

**6. Top 10 products**

```sql
SELECT mi.name, SUM(oi.quantity) as total_sold
FROM order_item oi
JOIN "order" o ON o.id = oi.order_id
JOIN menu_item mi ON mi.id = oi.menu_item_id
WHERE o.tenant_id = :tenant_id
  AND o.status NOT IN ('idle', 'pending_cart', 'pending_address', 'cancelled', 'payment_expired')
  AND o.created_at >= :period_start
  AND o.created_at < :period_end
GROUP BY mi.id, mi.name
ORDER BY total_sold DESC
LIMIT 10
```

### Supabase Implementation Notes

Some of these aggregations cross joined tables that PostgREST can't express cleanly. The dashboard calls two pre-created Postgres functions via `supabase.rpc()`:

- `dashboard_kpis(p_tenant_id, p_start, p_end)` → `{ order_count, revenue }`
- `dashboard_top_products(p_tenant_id, p_start, p_end, p_limit)` → rows of `{ name, total_sold }`

Both are defined in `zapfome-backend/src/db/migrations/009_dashboard_rpc_functions.sql` and are `security definer` with an explicit `tenant_user` authorization guard. Call them like:

```typescript
const { data: kpis } = await supabase.rpc('dashboard_kpis', {
  p_tenant_id: tenantId,
  p_start: periodStart.toISOString(),
  p_end: periodEnd.toISOString(),
});

const { data: topProducts } = await supabase.rpc('dashboard_top_products', {
  p_tenant_id: tenantId,
  p_start: periodStart.toISOString(),
  p_end: periodEnd.toISOString(),
  p_limit: 10,
});
```

Average ticket and trend percentages are derived in the dashboard from these values — no extra RPC is needed.

---

## Components Used

- `KpiCard` (x4)
- Period selector (a `<select>` or custom dropdown)
- Bar chart (custom, no library)

---

## Edge Cases

- **No orders yet**: KPI values show 0 / R$ 0,00. Trend shows "–" instead of a percentage. Top 10 section shows: "Nenhum produto vendido neste período."
- **Partial data**: If the current period just started (e.g., early morning for "Hoje"), trends may look extreme — this is expected.
- **Large numbers**: Revenue should handle values up to R$ 999.999,99 without layout overflow.
