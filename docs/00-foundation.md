# Phase 0 — Foundation

Everything that must exist before any screen can be built.

---

## 1. Dependencies

```bash
yarn add @supabase/supabase-js @supabase/ssr lucide-react date-fns
```

- `@supabase/supabase-js` — Supabase client (queries, auth)
- `@supabase/ssr` — cookie-based auth for Next.js App Router (server components + middleware)
- `lucide-react` — icon library (matches design system)
- `date-fns` — date formatting with PT-BR locale

---

## 2. Environment Variables

Create `.env.local` (never committed):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

The anon key is safe to expose — RLS policies protect data.

---

## 3. Supabase Client Setup

### `src/lib/supabase/client.ts` — Browser client

Used inside `"use client"` components. Creates a singleton Supabase client using `createBrowserClient` from `@supabase/ssr`.

### `src/lib/supabase/server.ts` — Server client

Used inside Server Components and Server Actions. Creates a per-request client using `createServerClient` from `@supabase/ssr` with cookie access via `next/headers`.

### `src/lib/supabase/middleware.ts` — Middleware helper

Used by `src/middleware.ts` to refresh the auth session on every request. Refreshes expired tokens transparently.

---

## 4. Auth Middleware

### `src/middleware.ts`

- Runs on every request.
- Refreshes the Supabase auth session (token rotation).
- Redirects unauthenticated users to `/login`.
- Redirects authenticated users away from `/login` to `/`.
- Protected paths: everything except `/login`.

**Important**: Read the Next.js middleware docs in `node_modules/next/dist/docs/` before implementing — this project uses Next.js 16, which may differ from stock middleware patterns.

---

## 5. Database Migrations

All DDL for the dashboard lives in the backend project — `zapfome-backend/src/db/migrations/`. The table-creation files (`001`–`006`) already define the final schema (including dashboard-only columns like `tenant.closed_message` and `tenant.paused_until`). The three migrations below add the dashboard-specific auth/access layer on top of that base schema:

| Migration | What it adds |
|---|---|
| `007_create_tenant_user.sql` | New `tenant_user` table mapping `auth.users` → `tenant`, plus a self-read RLS policy so a signed-in user can resolve their own tenant. |
| `008_dashboard_rls_policies.sql` | All tenant-scoped SELECT policies, plus write policies for the tables the dashboard mutates (`menu_item`, `menu_item_flavor`, `upsell_rule`, `delivery_zone` full CRUD; `business_hours` and `tenant_settings` insert/update for upserts; `tenant` and `"order"` update only). |
| `009_dashboard_rpc_functions.sql` | RPC functions `dashboard_kpis`, `dashboard_top_products`, `search_orders`, `order_history_stats`, each with an explicit `tenant_user` authorization guard and `execute` granted only to the `authenticated` role. |

The bot itself never reads `tenant_user` — it connects with the service-role key and bypasses RLS. These pieces exist purely to let dashboard users talk to the same database safely.

---

## 6. Tenant Context

### `src/lib/tenant.ts`

Server-side helper that resolves the current tenant from the auth session:

```
1. Get the current user from the Supabase server client
2. Query tenant_user WHERE user_id = auth.uid()
3. Fetch the tenant row
4. Return { tenant, tenantId }
```

This is called in Server Components and Server Actions that need tenant-scoped data. Every Supabase query in the dashboard MUST filter by the resolved `tenant_id`.

### `src/contexts/tenant-context.tsx`

Client-side React context that holds `{ tenant, tenantId }` for use in client components. Populated once in the dashboard layout from the server-resolved tenant and passed down.

---

## 7. Route Structure

```
src/app/
  (auth)/
    login/
      page.tsx                    # Screen 1 — Login
  (dashboard)/
    layout.tsx                    # Sidebar + top bar shell
    page.tsx                      # Screen 2 — Dashboard Home (Início)
    pedidos/
      page.tsx                    # Screen 3 — Orders Kanban
    cardapio/
      page.tsx                    # Screen 5 — Menu Management
    historico/
      page.tsx                    # Screen 8 — Order History
    configuracoes/
      page.tsx                    # Screen 7 — Settings
```

Route groups:
- `(auth)` — unauthenticated pages (login only). No sidebar/top bar.
- `(dashboard)` — all authenticated pages. Wrapped in the sidebar + top bar layout.

Screens 4 (Order Detail) and 6 (Menu Item Form) are modals — they render inside their parent page, not as separate routes.

---

## 8. Dashboard Layout Shell

### `src/app/(dashboard)/layout.tsx`

The shared layout for all authenticated pages. Contains:

**Sidebar** (fixed left, 240px wide):
- ZapFome logo + wordmark at top (24px padding)
- Navigation items (top to bottom):
  | Label | Icon (Lucide) | Route |
  |---|---|---|
  | Início | `Home` | `/` |
  | Pedidos | `ClipboardList` | `/pedidos` |
  | Cardápio | `UtensilsCrossed` | `/cardapio` |
  | Histórico | `Clock` | `/historico` |
  | Configurações | `Settings` | `/configuracoes` |
- Active item: brand-primary tinted background, white text + icon
- Inactive items: `--font-sidebar` color

**Top bar** (fixed top, 64px height):
- Left: restaurant name (`tenant.name`, 16/600)
- Center-right: "Bot ativo" status pill (green dot + label)
- Far right: user avatar (32x32 circle) with initials

**Main content area**: fills remaining space, background `--bg-secondary`, padding 24–32px.

---

## 9. Shared Types

### `src/lib/types/database.ts` — **already created**

All row types are pre-baked in [src/lib/types/database.ts](../src/lib/types/database.ts). They mirror the backend's per-module `.types.ts` files and match Postgres column names (snake_case). Exports:

- `Tenant` (includes `closed_message` and `paused_until`, both defined on the base `tenant` table in migration 001), `TenantSettings`, `TenantPayment`, `TenantMenuImage`, `BusinessHours`
- `MenuItem`, `MenuItemFlavor`, `UpsellRule`
- `DeliveryZone`
- `Customer`
- `OrderStatus`, `DeliveryType`, `PaymentMethod`
- `Order`, `OrderDeliveryInfo`, `OrderPayment`, `OrderItem`, `OrderItemFlavor`
- `TenantUser` (dashboard-only — backend has no equivalent)

If the backend schema changes, update this file to match. No generator, no codegen step.

---

## 10. Shared UI Components

Build these reusable components in `src/components/` before starting any screen. They implement the design system specs from `docs/design-system.md`:

| Component | File | Notes |
|---|---|---|
| `Button` | `button.tsx` | Variants: primary, secondary, destructive, success, text. Sizes: default, sm. Full-width prop. |
| `Input` | `input.tsx` | Label, placeholder, error state. Wraps `<input>` with design tokens. |
| `Card` | `card.tsx` | Generic card container. Optional border, shadow. |
| `Badge` | `badge.tsx` | Status pill. Variants: blue (novo), orange (em preparo), green (pago/finalizado), red (cancelado), neutral. |
| `Toggle` | `toggle.tsx` | On/off switch. 32x18 track. |
| `Modal` | `modal.tsx` | Overlay + panel. Header with title + close. Footer with actions. |
| `Table` | `table.tsx` | Styled table with header, rows, hover. |
| `KpiCard` | `kpi-card.tsx` | Icon + label + value + optional trend arrow. |
| `Sidebar` | `sidebar.tsx` | Navigation sidebar (used in layout). |
| `TopBar` | `top-bar.tsx` | Top bar (used in layout). |

---

## 11. Utility Helpers

### `src/lib/format.ts`

Formatting helpers for Brazilian locale:

- `formatCurrency(value: number): string` — Returns `R$ 1.234,56` format
- `formatPhone(phone: string): string` — Returns `(XX) XXXXX-XXXX` format
- `formatDate(date: string): string` — Returns `DD/MM/YYYY` format
- `formatDateTime(date: string): string` — Returns `DD/MM/YYYY HH:mm` format
- `formatTime(time: string): string` — Returns `HH:mm` format
- `timeAgo(date: string): string` — Returns relative time in PT-BR (e.g., "5 min", "1h")

---

## Implementation Order

Build in this sequence — each step unlocks the next:

1. Install dependencies
2. Supabase client setup (server + browser + middleware)
3. Auth middleware
4. Tenant context
5. Format utilities
6. Shared UI components
7. Dashboard layout shell (sidebar + top bar)
8. Login page (Screen 1) — first testable end-to-end flow
9. Remaining screens (2–8)

> Shared database types (`src/lib/types/database.ts`) and the backend migrations (001–009) are already done — see sections 5 and 9 above. Apply the backend migrations inside `zapfome-backend` before running the dashboard against Supabase.
