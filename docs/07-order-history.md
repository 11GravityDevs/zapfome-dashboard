# Screen 8 — Order History (Histórico)

## Overview

A tabular view of all past orders with filters, search, and summary statistics. Used for reviewing past performance, looking up specific orders, and exporting data. Read-only except for clicking into order details.

**Screenshot**: `zapfome-screens/Screen 8 - Order History.webp`

---

## Route

`/historico`

---

## Layout

### Top Bar

Left side:
- **Date range selector**: Dropdown with options: `Hoje`, `Últimos 7 dias` (default), `Últimos 30 dias`, `Este mês`
- **Search input**: placeholder "Buscar pelo nome ou nº pedido" — filters by customer name or order number

Right side:
- **"Exportar"** button — primary variant. Exports the current filtered data as CSV.

### Filter Row

Horizontal row of dropdown filters below the date/search bar:

| Filter | Options |
|---|---|
| Todos os status | Todos, Pago, Em preparo, Finalizado, Cancelado |
| Todos os tipos | Todos, Entrega, Retirada |
| Todos os pagamentos | Todos, Pix, Pagamento na entrega |

Each filter is a `<select>` dropdown. Changing any filter re-fetches the data.

### Summary Stats Bar

Horizontal row of inline metrics, separated by dividers:

- **Receita**: `R$ 18.432,00` (14/700, `--font-primary`) — sum of `order_payment.total` for filtered orders
- **Pedidos**: `247` (14/700) — count of filtered orders
- **Ticket médio**: `R$ 76,60` (14/700) — `receita / pedidos`
- **Cancelamento**: `3,2%` (14/700) — percentage of cancelled orders in the filtered set

Each metric has a small icon and label (12/500, `--font-secondary`) above the value.

### Orders Table

Full-width `Table` component:

| Column | Content | Alignment | Sortable |
|---|---|---|---|
| Pedido # | `#0247` (14/600) | left | yes |
| Cliente | Customer name (14/400) | left | yes |
| Pedido a | Date/time `DD/MM/YYYY HH:mm` (14/400) | left | yes (default: desc) |
| Tipo | `Badge` — "Entrega" (blue) or "Retirada" (neutral) | center | yes |
| Total | `R$ 85,00` (14/600) | right | yes |
| Pagamento | `Badge` — "Pix" (green) or "Pagamento na entrega" (neutral) | center | yes |
| Status | `Badge` — colored by status | center | yes |

**Status badge mapping:**
- `paid` → "Pago" green
- `preparing` → "Em preparo" orange
- `done` → "Finalizado" green
- `cancelled` → "Cancelado" red
- `payment_expired` → "Expirado" red

**Row click**: Opens the Order Detail modal (Screen 4) for that order.

**Row hover**: `--bg-hover` background.

### Pagination

Bottom of the table:
- "Mostrando 1-20 de 247 pedidos" (12/400, `--font-secondary`)
- Page navigation: `< 1 2 3 ... 13 >` — simple numbered pagination
- Page size: 20 rows per page (fixed, no selector needed)

---

## Data Requirements

### Queries

**Filtered orders with pagination:**

```typescript
let query = supabase
  .from('order')
  .select(`
    *,
    customer (name, phone),
    order_delivery_info (type),
    order_payment (payment_method, total, paid_at)
  `, { count: 'exact' })
  .eq('tenant_id', tenantId)
  .not('status', 'in', '("idle","pending_cart","pending_address","awaiting_payment")')
  .gte('created_at', periodStart)
  .lt('created_at', periodEnd)
  .order('created_at', { ascending: false })
  .range(offset, offset + pageSize - 1);

// Apply optional filters
if (statusFilter !== 'all') {
  query = query.eq('status', statusFilter);
}
if (typeFilter !== 'all') {
  query = query.eq('order_delivery_info.type', typeFilter);
}
if (paymentFilter !== 'all') {
  query = query.eq('order_payment.payment_method', paymentFilter);
}
if (searchQuery) {
  // Search by order number or customer name
  query = query.or(
    `order_number.eq.${parseInt(searchQuery) || 0},customer.name.ilike.%${searchQuery}%`
  );
}
```

**Note on search**: Searching across joined tables (customer name) with Supabase `.or()` is awkward, so this screen uses two pre-created Postgres functions defined in `zapfome-backend/src/db/migrations/009_dashboard_rpc_functions.sql`:

- `search_orders(p_tenant_id, p_start, p_end, p_search, p_status, p_delivery_type, p_payment_method, p_limit, p_offset)` — returns rows of `{ id, order_number, status, created_at, customer_name, customer_phone, delivery_type, payment_method, total }`
- `order_history_stats(p_tenant_id, p_start, p_end)` — returns `{ total_orders, total_revenue, cancelled_count }`

Call them with `.rpc()`. Any filter argument can be `null` to skip that filter:

```typescript
const { data: orders } = await supabase.rpc('search_orders', {
  p_tenant_id: tenantId,
  p_start: periodStart.toISOString(),
  p_end: periodEnd.toISOString(),
  p_search: searchQuery || null,
  p_status: statusFilter === 'all' ? null : statusFilter,
  p_delivery_type: typeFilter === 'all' ? null : typeFilter,
  p_payment_method: paymentFilter === 'all' ? null : paymentFilter,
  p_limit: 20,
  p_offset: (page - 1) * 20,
});

const { data: stats } = await supabase.rpc('order_history_stats', {
  p_tenant_id: tenantId,
  p_start: periodStart.toISOString(),
  p_end: periodEnd.toISOString(),
});
```

Both functions are `security definer` with an explicit `tenant_user` authorization check, and `execute` is granted only to the `authenticated` role.

Derived values (computed in the dashboard, not returned by the RPC):
- `ticket_medio = total_revenue / total_orders`
- `cancelamento_pct = (cancelled_count / total_orders) * 100`

---

### CSV Export

When the user clicks "Exportar", generate a CSV from the current filtered dataset (all pages, not just the visible page). Columns:

```
Pedido,Cliente,Telefone,Data,Tipo,Total,Pagamento,Status
#0247,Maria Silva,(11) 98765-4321,10/04/2026 12:30,Entrega,85.00,Pix,Finalizado
```

Use a client-side CSV generation approach — fetch all matching orders (no pagination) and build the CSV string. Trigger a download with `<a download="pedidos.csv">`.

---

## Components Used

- `Table` (orders list)
- `Badge` (status, delivery type, payment method)
- `Input` (search)
- `Button` (export)
- `Modal` (order detail — reuse from Screen 4)

---

## Behavior & Interactions

- **Default view**: Shows "Últimos 7 dias" on first load with no filters applied.
- **Filter changes**: Each filter change resets to page 1 and re-fetches.
- **Search**: Debounce the search input (300ms) before querying. Reset to page 1 on search.
- **Sort**: Click column headers to sort. Toggle between ascending/descending. Default sort: `created_at` descending.
- **Row click**: Opens the Order Detail modal (Screen 4). When opened from history, the modal may show different action buttons (e.g., no "Aceitar" for already-finished orders).

---

## Edge Cases

- **No orders in range**: Show empty table with message: "Nenhum pedido encontrado para o período selecionado."
- **Search with no results**: Same empty message: "Nenhum pedido encontrado."
- **Large datasets**: Pagination is essential. The RPC function with `LIMIT`/`OFFSET` keeps queries fast. For very large tenants (1000+ orders/day), consider adding an index on `(tenant_id, created_at DESC)` — already exists in the migrations.
- **Export large datasets**: If the filtered set has thousands of orders, the export fetch may take a few seconds. Show a loading state on the export button: spinner + "Exportando..."
- **Order number search**: The search should handle both `#247` and `247` as input (strip the `#` prefix if present).
