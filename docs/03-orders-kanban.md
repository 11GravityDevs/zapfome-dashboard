# Screen 3 — Orders Kanban (Pedidos)

## Overview

The most critical screen in the dashboard. This is where the restaurant owner lives during service — accepting new orders, tracking preparation, and marking orders as ready. Must be fast, scannable, and optimized for quick actions under time pressure.

**Screenshots**:
- `zapfome-screens/Screen 3 - Orders Kanban Linear.webp` — Main view
- `zapfome-screens/Screen 3 - Orders Kanban Linear-1.webp` — With "Pause orders" modal

---

## Route

`/pedidos`

---

## Layout

### Top Bar Actions

- Right side: **"Pausar pedidos"** button — destructive outline style, opens the pause modal

### Kanban Board

Four columns, horizontally scrollable on smaller screens. Each column has:
- A colored top strip (8px tall)
- Column title (14/700) + count badge (matching light tint)
- Vertical stack of order cards, gap 12px

| Column | Title | Color | Order statuses shown | Card action button |
|---|---|---|---|---|
| 1 | Para aceitar | `--accent-blue` | `paid` | "Aceitar pedido" (success variant) |
| 2 | Em preparo | `--accent-orange` | `preparing` | "Marcar como pronto" (primary variant) |
| 3 | Prontos | `--accent-green` | `done` (recent, today) | — none — |
| 4 | Finalizados | `--dark-300` | `done` (older) | — none, cards faded — |

**Column width**: 320–360px each. On desktop (>1280px), all 4 columns should be visible. On smaller screens, horizontal scroll.

**Status mapping** (backend → kanban):
- `paid` → "Para aceitar" — payment confirmed, restaurant needs to accept
- `preparing` → "Em preparo" — restaurant accepted, cooking
- `done` (last 2 hours) → "Prontos" — food ready
- `done` (older than 2 hours) → "Finalizados" — completed, faded appearance

Orders with status `idle`, `pending_cart`, `pending_address`, `confirmed`, `awaiting_payment`, `payment_expired`, `cancelled` are **not shown** on the kanban.

---

## Order Card Component

Each card in the kanban shows (from top to bottom):

**Header row:**
- Order number: `#42` (14/700, `--font-primary`)
- Payment badge: `Badge` component
  - `Pix` → green variant (if `order_payment.payment_method = 'pix'`)
  - `Pagamento na entrega` → neutral variant (if `payment_method = 'on_delivery'`)

**Customer row:**
- Customer name (14/600, `--font-primary`)
- Delivery type badge:
  - `Entrega` → blue variant (if `order_delivery_info.type = 'delivery'`)
  - `Retirada` → neutral variant (if `type = 'pickup'`)

**Items preview:**
- First 2–3 items listed: `"1x Pizza Calabresa"` (12/400, `--font-secondary`)
- If more items: `"+ 2 itens"` suffix

**Footer row:**
- Time elapsed: `"12 min"` (12/400, `--font-secondary`) — relative time since `order.created_at`
- Total: `"R$ 85,00"` (16/700, `--font-primary`) — from `order_payment.total`

**Action button** (full-width at card bottom):
- Column 1: "Aceitar pedido" — `Button` success variant
- Column 2: "Marcar como pronto" — `Button` primary variant
- Columns 3 & 4: no button

**Card click**: Opens the Order Detail modal (Screen 4).

**"Finalizados" column styling**: Cards have `opacity: 0.7`, no action button, no hover lift.

---

## Pause Orders Modal

Triggered by clicking "Pausar pedidos" button.

**Modal content:**
- Title: "Pausar recebimento de pedidos"
- Description: "Determine por quanto tempo deseja pausar o recebimento de novos pedidos pelo WhatsApp."
- **Duration options** (radio-style selection, horizontal row):
  - `15 min` | `30 min` | `1 hora` | `Outro`
  - "Outro" reveals a text input for custom minutes
- Warning text (orange, 12/500): "Isso impedirá automaticamente que clientes façam novos pedidos pelo WhatsApp."
- **Footer actions:**
  - "Cancelar" — secondary button
  - "Pausar pedidos" — destructive button (red)

**Behavior**: The `tenant.paused_until timestamptz` column is defined on the base `tenant` table (see backend migration `001_create_tenants.sql`). On submit, update it to `now() + <selected duration>`. The bot reads this column and rejects new orders while it is in the future. To unpause, set it back to `null`. Clicking "Cancelar" simply closes the modal.

---

## Data Requirements

### Queries

**Active orders for the kanban:**

```sql
SELECT
  o.*,
  c.name as customer_name,
  c.phone as customer_phone,
  odi.type as delivery_type,
  op.payment_method,
  op.total
FROM "order" o
JOIN customer c ON c.id = o.customer_id
LEFT JOIN order_delivery_info odi ON odi.order_id = o.id
LEFT JOIN order_payment op ON op.order_id = o.id
WHERE o.tenant_id = :tenant_id
  AND o.status IN ('paid', 'preparing', 'done')
  AND o.created_at >= :today_start
ORDER BY o.created_at ASC
```

**Items preview for each order:**

```sql
SELECT
  oi.quantity,
  mi.name
FROM order_item oi
JOIN menu_item mi ON mi.id = oi.menu_item_id
WHERE oi.order_id = :order_id
ORDER BY oi.id
```

### Supabase Client Query

```typescript
const { data: orders } = await supabase
  .from('order')
  .select(`
    *,
    customer (name, phone),
    order_delivery_info (type),
    order_payment (payment_method, total),
    order_item (quantity, menu_item (name))
  `)
  .eq('tenant_id', tenantId)
  .in('status', ['paid', 'preparing', 'done'])
  .gte('created_at', todayStart)
  .order('created_at', { ascending: true });
```

### Mutations

**Accept order** (move to "Em preparo"):

```typescript
await supabase
  .from('order')
  .update({ status: 'preparing', updated_at: new Date().toISOString() })
  .eq('id', orderId)
  .eq('tenant_id', tenantId);
```

**Mark as ready** (move to "Prontos"):

```typescript
await supabase
  .from('order')
  .update({ status: 'done', updated_at: new Date().toISOString() })
  .eq('id', orderId)
  .eq('tenant_id', tenantId);
```

### Polling

Poll every **15 seconds** for new/updated orders. Use a simple `setInterval` that re-fetches the full query. Avoid stale state by always replacing the entire order list (not merging).

Display a subtle "Última atualização: 12:30:45" timestamp in the page header so the owner knows data is fresh.

---

## Components Used

- `Badge` (payment method, delivery type, column count)
- `Button` (accept, mark ready, pause)
- `Modal` (pause orders)
- `Card` (order cards — specialized variant)

---

## Edge Cases

- **No orders today**: Show empty kanban with centered message: "Nenhum pedido ainda hoje. Os novos pedidos aparecerão aqui automaticamente."
- **Many orders in one column**: Column scrolls vertically. The kanban container stays at viewport height.
- **Rapid status changes**: Polling may show brief inconsistencies. Optimistically move the card to the next column immediately on button click, then reconcile on the next poll.
- **Order appears in wrong column**: If an order was created before today but status changed today, it may appear. Filter by `created_at >= today` to keep the view focused.
- **Cancelled orders**: Not shown on the kanban. If an order is cancelled while visible, it disappears on the next poll.
