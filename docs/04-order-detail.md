# Screen 4 — Order Detail (Modal)

## Overview

A modal overlay that shows the full details of a single order. Opened by clicking any order card on the kanban (Screen 3) or any row in the order history (Screen 8). Allows the owner to see everything about the order and take actions (accept, mark ready, cancel, reprint).

**Screenshot**: `zapfome-screens/Screen 4 - Order Detail.webp`

---

## Route

No dedicated route — this is a modal rendered within the parent page (`/pedidos` or `/historico`).

---

## Layout

Uses the `Modal` component (drawer variant, right-pinned, width 520px).

### Header

- Title: `"Pedido #42"` (20/600) + status `Badge` inline (e.g., "Novo", "Em preparo", "Pronto")
- Close button (X icon, top-right)

### Customer Section

- Customer name (16/600, `--font-primary`) + delivery type `Badge` ("Entrega" blue / "Retirada" neutral)
- Phone number with WhatsApp icon: `(11) 98765-4321` (14/400, `--font-secondary`, clickable — links to `https://wa.me/5511987654321`)

### Items Table

| Column | Alignment | Content |
|---|---|---|
| Item | left | Menu item name (14/600) |
| Sabores / Observação | left | Flavor names comma-separated, or observation text (12/400, `--font-secondary`) |
| Qtd | center | Quantity (14/400) |
| Preço | right | `unit_price × quantity` formatted as currency (14/400) |

Below the table:
- **Items subtotal**: "Itens para R$ 85,00" — right-aligned, 14/600

### Delivery Section

Only shown if `delivery_type = 'delivery'`:
- Delivery address: `"Rua das Flores, 123 — Centro"` (14/400)
- Delivery fee: `"Taxa de entrega: R$ 5,00"` (14/400, `--font-secondary`)

If `delivery_type = 'pickup'`:
- Show: `"Retirada no local"` (14/400)

### Estimated Time

- `"50 min"` (14/400, `--font-secondary`) — calculated from tenant settings based on delivery type:
  - Delivery: `delivery_time_min`–`delivery_time_max` from `tenant_settings`
  - Pickup: `pickup_time_min`–`pickup_time_max`

### Payment Summary

Vertical stack:
- `Subtotal: R$ 85,00` (14/400)
- `Taxa de entrega: R$ 5,00` (14/400) — only if delivery
- `Total: R$ 90,00` (16/700, `--font-primary`)
- Payment info: `"Pago via Pix em 04/06/2025 12:30"` or `"Pagamento na entrega"` (12/400, `--font-secondary`)

### Footer Actions

Two rows of buttons:

**Reprint row** (secondary actions):
- "Reimprimir cozinha" — secondary outline button with printer icon
- "Reimprimir balcão" — secondary outline button with printer icon

**Primary action row** (depends on order status):

| Order status | Left button | Right button |
|---|---|---|
| `paid` | "Cancelar pedido" (destructive outline) | "Aceitar pedido" (success) |
| `preparing` | "Cancelar pedido" (destructive outline) | "Marcar como pronto" (primary) |
| `done` | — | — (no actions, order is finished) |
| `cancelled` | — | — (show "Pedido cancelado" text) |

---

## Data Requirements

### Query

Fetch full order details (same as backend's `getOrderWithDetails`):

```typescript
// Fetch order with all related data
const { data: order } = await supabase
  .from('order')
  .select(`
    *,
    customer (name, phone),
    order_delivery_info (*),
    order_payment (*),
    order_item (
      *,
      menu_item (name),
      order_item_flavor (
        *,
        menu_item_flavor (name)
      )
    )
  `)
  .eq('id', orderId)
  .eq('tenant_id', tenantId)
  .single();
```

Also fetch tenant settings for estimated time:

```typescript
const { data: settings } = await supabase
  .from('tenant_settings')
  .select('pickup_time_min, pickup_time_max, delivery_time_min, delivery_time_max')
  .eq('tenant_id', tenantId)
  .single();
```

### Mutations

**Accept order:**

```typescript
await supabase
  .from('order')
  .update({
    status: 'preparing',
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)
  .eq('tenant_id', tenantId);
```

**Mark as ready:**

```typescript
await supabase
  .from('order')
  .update({
    status: 'done',
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)
  .eq('tenant_id', tenantId);
```

**Cancel order:**

```typescript
await supabase
  .from('order')
  .update({
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId)
  .eq('tenant_id', tenantId);
```

**Cancel requires confirmation**: Show a small confirm dialog before cancelling: "Tem certeza que deseja cancelar o pedido #42?" with "Não" (secondary) and "Sim, cancelar" (destructive) buttons.

### Reprint

Reprint buttons trigger the ESC/POS print agent on the backend. For now, these buttons can call a backend API endpoint or simply be disabled/hidden if the print agent integration isn't wired up from the dashboard. Mark them as a future integration point.

---

## Components Used

- `Modal` (drawer variant)
- `Badge` (status, delivery type, payment method)
- `Button` (accept, mark ready, cancel, reprint)
- `Table` (items list)

---

## Edge Cases

- **Order with no items**: Shouldn't happen (bot enforces at least one item), but show "Nenhum item neste pedido." if the items array is empty.
- **Order with flavors**: Display flavor names below the item name in the Sabores column, comma-separated. If the item has fractions (e.g., half/half), show as "1/2 Calabresa, 1/2 Mussarela".
- **Long observation text**: Truncate at 140 chars (DB constraint) — should always fit, but wrap to a second line if needed.
- **Order already actioned**: If the owner clicks "Aceitar" but someone else already accepted (status already changed), the update will succeed silently (idempotent). Refresh the modal state after the mutation.
- **Missing payment data**: If `order_payment` is null (shouldn't happen for paid orders), show "Pagamento não registrado" in `--accent-red`.
