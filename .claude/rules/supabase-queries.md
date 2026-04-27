---
paths:
  - "src/lib/**/*.ts"
  - "src/app/**/page.tsx"
---

# Supabase & Tenant Scoping Rules

- Every Supabase query MUST be scoped to tenant_id. No exceptions.
- Server-side: call `getCurrentTenant()` from `@/lib/tenant`, handle all four resolution states (`unauthenticated`, `no_tenant`, `inactive`, `ok`).
- Client-side: get tenantId from `useTenant()` hook (`@/contexts/tenant-context`).
- RPC calls: always pass `p_tenant_id` parameter.
- The dashboard shares its Supabase database with zapfome-backend (WhatsApp bot). Reads and ordinary writes go straight to Supabase; the one exception is order status transitions (`ready` / `out_for_delivery` / `done` / `cancelled`), which MUST go through `PATCH /api/dashboard/orders/:id/status` on the backend via `updateOrderStatus()` in `@/lib/api/orders` so the customer gets the WhatsApp notification.
