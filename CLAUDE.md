# Zapfome Dashboard

Multi-tenant WhatsApp food-ordering dashboard for Brazilian restaurants. Web tool restaurant owners use to run daily operations (orders, menu, settings) during the lunch/dinner rush. All UI copy is **Brazilian Portuguese (PT-BR)** — no English fallbacks.

@AGENTS.md

## Stack

- **Next.js 16.2.3** (App Router) — see warning above, this is not the Next.js in your training data
- **React 19.2** + **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first config via `@theme` in [src/app/globals.css](src/app/globals.css), not `tailwind.config.js`)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — database queries, auth, RLS
- **Lucide React** — icon library (matches design system)
- **date-fns** — date formatting with PT-BR locale
- **Yarn** as the package manager (`yarn.lock` is the source of truth — do not run `npm install`)
- Path alias: `@/*` → `./src/*`

## Commands

```bash
yarn dev           # start dev server (http://localhost:3000)
yarn build         # production build
yarn start         # serve the production build
yarn lint          # eslint (flat config in eslint.config.mjs)
```

There is no test runner wired up yet. Do not invent one without asking.

## Layout

- [src/app/](src/app/) — App Router routes, layouts, and `globals.css`. Server Components by default; only opt into `"use client"` when you need browser APIs or interactivity.
- [src/lib/](src/lib/) — Supabase clients, tenant context, types, formatting utilities.
- [src/lib/constants/](src/lib/constants/) — Constant values and related types. **Domain files** (`dashboard.ts`, `orders.ts`) for domain-specific constants; **topic files** (`status.ts`) for constants shared across domains.
- [src/lib/utils/](src/lib/utils/) — Pure utility functions. **Domain files** (`dashboard.ts`, `orders.ts`) for domain-specific logic; **topic files** (`date.ts`, `math.ts`) for helpers reused across domains.
- [src/components/](src/components/) — Reusable UI components (Button, Input, Card, Badge, Toggle, Modal, Table, etc.).
- [src/contexts/](src/contexts/) — React context providers (tenant context).
- [docs/design-system.md](docs/design-system.md) — **read before any UI work.** Token names, type scale, spacing, and component rules.
- [docs/](docs/) — Implementation plans per screen (00-foundation through 07-order-history). **Read the relevant screen doc before implementing.**
- [design.pen](design.pen) — encrypted canonical visual source. Read/write **only** through the `pencil` MCP tools (`batch_get`, `batch_design`); never `Read`/`Grep` it.

## Route Structure

```
src/app/
  (auth)/
    login/page.tsx                # Login (email + password via Supabase Auth)
  (dashboard)/
    layout.tsx                    # Sidebar + top bar shell (all authenticated pages)
    page.tsx                      # Dashboard Home — KPIs + top products
    pedidos/page.tsx              # Orders Kanban — real-time order management
    cardapio/page.tsx             # Menu Management — items, flavors, availability
    historico/page.tsx            # Order History — table with filters + export
    configuracoes/page.tsx        # Settings — hours, delivery, general config
```

## Architecture

- **Auth**: Supabase Auth (email/password). Session managed via `@supabase/ssr` cookies. Middleware refreshes tokens and protects routes.
- **Multi-tenancy**: `tenant_user` table maps `auth.uid()` → `tenant_id`. Every query must be scoped to the resolved `tenant_id`. RLS policies enforce this at the DB level.
- **Data access**: Dashboard talks directly to Supabase (no backend API). Server Components use the server Supabase client; client components use the browser client.
- **Polling**: Orders page polls every 15 seconds for updates (no Supabase Realtime for now).
- **Backend relationship**: The `zapfome-backend` project is the WhatsApp bot. It shares the same Supabase database. The dashboard reads/writes the same tables but never calls the backend API.

## Design system rules (load-bearing)

- **Never hardcode** colors, spacing, radii, font sizes, or shadows. Always reference the CSS custom property tokens defined in [docs/design-system.md](docs/design-system.md) and mirrored in [src/app/globals.css](src/app/globals.css).
- If a token you need does not exist, **stop and ask** — do not invent intermediate shades or sizes.
- If you change a token, update **both** [src/app/globals.css](src/app/globals.css) and [design.pen](design.pen) (via pencil MCP) so they stay in sync.
- Audience is non-technical and time-pressured: prefer large touch targets, never hide primary actions behind hover or tiny icons.

## Conventions

- TypeScript `strict` is on — no `any` escape hatches without a clear reason.
- Tailwind v4: extend the design system via `@theme` in `globals.css`, not a JS config file.
- Co-locate route-specific components under their `src/app/<route>/` folder; promote to `src/components/` only when reused across routes.
- **Keep page files thin.** Page components (`page.tsx`) should only contain rendering logic and data-fetching orchestration. Extract constants to `src/lib/constants/` and pure utility functions to `src/lib/utils/`. Use **domain files** for domain-specific code (`dashboard.ts`, `orders.ts`, `menu.ts`) and **topic files** for shared cross-domain helpers (`date.ts`, `math.ts`). If a function only serves one domain, it stays in the domain file; the moment a second domain needs it, promote it to a topic file.
- Imports use the `@/` alias for anything under `src/`.
- **Comments: only when VERY essential.** Prefer self-documented code — good names over prose. No JSDoc blocks restating what a function does, no explanatory preambles, no section banners. Keep a comment only when its absence would cause a real bug or leave a non-obvious trap for the next reader (e.g. "do not remove this line — it's what refreshes the cookies"). Delete everything else.

## Verifying UI work

Type-checking and lint verify code correctness, not feature correctness. For any UI change, start `yarn dev`, exercise the feature in a browser, and check the golden path plus one or two edge cases before reporting the task complete. If you cannot test the UI for some reason, say so explicitly instead of claiming success.
