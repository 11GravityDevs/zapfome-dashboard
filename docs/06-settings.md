# Screen 7 — Settings (Configurações)

## Overview

Single page with all restaurant settings organized in sections. The owner configures business hours, delivery zones, operational parameters, and establishment info. All changes are saved with a single "Salvar alterações" action at the bottom.

**Screenshot**: `zapfome-screens/Screen 7 - Settings.webp`

---

## Route

`/configuracoes`

---

## Layout

The page is a single vertical scroll with four distinct sections, each inside a `Card` component. A floating or bottom-anchored save button persists.

### Section 1: Horário de funcionamento

**Header**: "Horário de funcionamento" (18/600) with a clock icon (Lucide `Clock`)

**Table** with columns:

| Dia | Abre | Fecha | Fechado |
|---|---|---|---|
| Segunda | `<input type="time">` | `<input type="time">` | `Toggle` |
| Terça | ... | ... | ... |
| Quarta | ... | ... | ... |
| Quinta | ... | ... | ... |
| Sexta | ... | ... | ... |
| Sábado | ... | ... | ... |
| Domingo | ... | ... | ... |

- **Dia**: Day name (14/600), not editable
- **Abre**: Time input, `HH:mm` format. Disabled if "Fechado" is toggled on.
- **Fecha**: Time input, `HH:mm` format. Disabled if "Fechado" is toggled on.
- **Fechado**: `Toggle` component. When on, the day is marked as closed and time inputs are disabled/grayed out.

**Validation warning** (inline, yellow banner): If a day has unusual hours (e.g., close time before open time, or very late hours), show: "Este dia está configurado fora do padrão" with `--warning-500` left border.

**Day-of-week mapping**: `0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado`

---

### Section 2: Zonas de entrega

**Header**: "Zonas de entrega" (18/600) with a map pin icon (Lucide `MapPin`)

**Table** with columns:

| Bairro | Cidade | Taxa (R$) | Ativo | Ações |
|---|---|---|---|---|
| Centro | São Paulo | R$ 5,00 | `Toggle` | Edit / Delete icons |
| Jardins | São Paulo | R$ 8,00 | ... | ... |

- **Bairro**: Neighborhood name (14/400)
- **Cidade**: City name (14/400)
- **Taxa (R$)**: Delivery fee formatted as currency (14/400)
- **Ativo**: `Toggle` to enable/disable the zone without deleting it
- **Ações**: Edit (pencil icon) and Delete (trash icon) — 20px Lucide icons, `--font-secondary` color, hover `--font-primary`

**"+ Adicionar zona"** button below the table — primary variant. Opens an inline row or small modal with fields: Bairro, Cidade, Taxa (R$).

---

### Section 3: Configurações gerais

**Header**: "Configurações gerais" (18/600) with a settings icon (Lucide `SlidersHorizontal`)

**Form fields** in a grid layout:

| Field | Type | Label | Notes |
|---|---|---|---|
| Pedido mínimo | `Input` number | "Pedido mínimo" | Currency input, e.g., `R$ 25,00` |
| Tempo de entrega (min) | Two `Input` number fields | "Tempo de entrega (min)" | Side by side: min – max (e.g., 30 – 60) |
| Tempo de retirada (min) | Two `Input` number fields | "Tempo de retirada (min)" | Side by side: min – max (e.g., 20 – 40) |
| Mensagem de boas-vindas | `Input` textarea | "Mensagem de boas-vindas" | The greeting sent to new customers on WhatsApp |
| Mensagem de fechado | `Input` textarea | "Mensagem de fechado" | Message sent when the restaurant is closed |

**Layout**: "Pedido mínimo" on one line. "Tempo de entrega" and "Tempo de retirada" side by side (2 columns). Textareas are full-width.

---

### Section 4: Dados do estabelecimento

**Header**: "Dados do estabelecimento" (18/600) with a building icon (Lucide `Building2`)

**Form fields** in a 2-column grid:

| Field | Type | Label |
|---|---|---|
| Nome | `Input` text | "Nome" |
| Telefone | `Input` text | "Telefone" |
| Endereço | `Input` text | "Endereço" |
| Cidade | `Input` text | "Cidade" |

---

### Save Button

Fixed at bottom-right or as a floating action button:
- "Salvar alterações" — success variant (`Button` with `--success-500` fill)
- Only enabled when there are unsaved changes (dirty form detection)
- On click: saves all four sections in parallel
- Show toast on success: "Configurações salvas com sucesso."

---

## Data Requirements

### Queries

**Load all settings on page mount:**

```typescript
// Parallel fetch all settings data
const [
  { data: tenant },
  { data: settings },
  { data: businessHours },
  { data: deliveryZones },
] = await Promise.all([
  supabase
    .from('tenant')
    .select('name, phone, address, city, greeting_message, closed_message')
    .eq('id', tenantId)
    .single(),
  supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single(),
  supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('day_of_week'),
  supabase
    .from('delivery_zone')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('neighborhood'),
]);
```

### Mutations

**Save business hours** (upsert all 7 days):

```typescript
await supabase
  .from('business_hours')
  .upsert(
    days.map(day => ({
      tenant_id: tenantId,
      day_of_week: day.dayOfWeek,
      open_time: day.isClosed ? null : day.openTime,
      close_time: day.isClosed ? null : day.closeTime,
      is_closed: day.isClosed,
    })),
    { onConflict: 'tenant_id,day_of_week' }
  );
```

**Save tenant settings:**

```typescript
await supabase
  .from('tenant_settings')
  .upsert({
    tenant_id: tenantId,
    min_order_value: minOrderValue,
    pickup_time_min: pickupTimeMin,
    pickup_time_max: pickupTimeMax,
    delivery_time_min: deliveryTimeMin,
    delivery_time_max: deliveryTimeMax,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id' });
```

**Save tenant data:**

```typescript
await supabase
  .from('tenant')
  .update({
    name,
    phone,
    address,
    city,
    greeting_message: greetingMessage,
    closed_message: closedMessage,
  })
  .eq('id', tenantId);
```

**Add delivery zone:**

```typescript
await supabase
  .from('delivery_zone')
  .insert({
    tenant_id: tenantId,
    neighborhood,
    city,
    fee,
    is_active: true,
  });
```

**Update delivery zone:**

```typescript
await supabase
  .from('delivery_zone')
  .update({ neighborhood, city, fee })
  .eq('id', zoneId)
  .eq('tenant_id', tenantId);
```

**Toggle delivery zone active:**

```typescript
await supabase
  .from('delivery_zone')
  .update({ is_active: !currentValue })
  .eq('id', zoneId)
  .eq('tenant_id', tenantId);
```

**Delete delivery zone:**

```typescript
await supabase
  .from('delivery_zone')
  .delete()
  .eq('id', zoneId)
  .eq('tenant_id', tenantId);
```

Delete requires confirmation: "Tem certeza que deseja remover a zona [neighborhood]?"

---

## Behavior & Interactions

- **Dirty tracking**: Track whether any field has been modified since the last save. Enable the "Salvar alterações" button only when dirty. Optionally show a warning if the user navigates away with unsaved changes.
- **Business hours initialization**: If no `business_hours` rows exist for the tenant (fresh setup), pre-fill all 7 days with default times (e.g., 11:00–23:00) and `is_closed = false` for weekdays, `is_closed = true` for Sunday.
- **Delivery zone inline edit**: Clicking the edit icon on a zone row makes the row editable inline (inputs replace text). Pressing Enter or clicking a save icon commits the change.
- **"Mensagem de fechado"**: Stored in `tenant.closed_message` (defined on the base `tenant` table in backend migration `001_create_tenants.sql`). Save it alongside the other `tenant` fields in the same update call — no separate mutation needed.
- **Validation**: Time inputs must have `close_time > open_time`. Min/max time ranges must satisfy `max >= min`. Delivery fee must be `>= 0`.

---

## Components Used

- `Card` (section containers)
- `Input` (all form fields — text, number, time, textarea)
- `Toggle` (business hours closed, delivery zone active)
- `Button` (save, add zone, delete zone)
- `Table` (business hours, delivery zones)

---

## Edge Cases

- **No tenant_settings row**: If the tenant was just onboarded and has no settings, create default values on first save (or pre-fill with defaults from the DB column defaults).
- **No business hours**: Pre-fill all 7 days with defaults.
- **No delivery zones**: Show empty table with message: "Nenhuma zona de entrega configurada." and the "Adicionar zona" button.
- **Concurrent edits**: If two users edit settings simultaneously, last write wins. No conflict resolution needed for MVP.
- **Greeting message with special characters**: WhatsApp supports emojis and line breaks. Allow them in the textarea, but sanitize to prevent XSS when rendering in the dashboard.
