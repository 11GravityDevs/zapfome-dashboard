# Zapfome Dashboard

Multi-tenant WhatsApp food-ordering dashboard for Brazilian restaurants. Web tool restaurant owners use to run daily operations (orders, menu, settings) during the lunch/dinner rush. All UI copy is **Brazilian Portuguese (PT-BR)** — no English fallbacks.

<!-- BEGIN:nextjs-agent-rules -->
**This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quality Gate Subagents

| Subagent | Model | What it checks |
|---|---|---|
| `reviewer` | Opus | Architecture, tenant scoping, TypeScript strict, PT-BR copy, component reuse, Next.js 16 patterns, code conventions |
| `design-system-checker` | Sonnet | Hardcoded colors/spacing/radii/shadows, design token usage, component spec compliance, status color mapping, locale formatting |

**Implementation workflow:** Read plan doc + design-system.md -> Implement -> `yarn lint` -> delegate to `reviewer` -> delegate to `design-system-checker` -> fix CRITICAL/HIGH issues -> report.

Both subagents are **read-only**. Neither should read `design.pen` (encrypted) or spawn other subagents.

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
yarn typecheck     # tsc --noEmit (strict mode)
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
- [docs/](docs/) — Screen specs (00-foundation through 07-order-history). All screens are implemented. Read the relevant spec when modifying a screen or debugging behavior.
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

Detailed token rules load automatically for `.tsx` files via `.claude/rules/design-tokens.md`. Core principle: **never hardcode colors, spacing, radii, font sizes, or shadows** — use CSS custom property tokens from [docs/design-system.md](docs/design-system.md) and [src/app/globals.css](src/app/globals.css).

## Conventions

- TypeScript `strict` is on — no `any` escape hatches without a clear reason.
- Tailwind v4: extend the design system via `@theme` in `globals.css`, not a JS config file.
- Co-locate route-specific components under their `src/app/<route>/` folder; promote to `src/components/` only when reused across routes.
- **Keep page files thin.** Detailed rules load automatically for `page.tsx` files via `.claude/rules/page-files.md`. Core principle: extract constants to `src/lib/constants/` and utilities to `src/lib/utils/`, using domain files for domain-specific code and topic files for cross-domain helpers.
- Imports use the `@/` alias for anything under `src/`.
- **Comments: only when VERY essential.** Prefer self-documented code — good names over prose. No JSDoc blocks restating what a function does, no explanatory preambles, no section banners. Keep a comment only when its absence would cause a real bug or leave a non-obvious trap for the next reader (e.g. "do not remove this line — it's what refreshes the cookies"). Delete everything else.

## Verifying UI work

Type-checking and lint verify code correctness, not feature correctness. For any UI change, start `yarn dev`, exercise the feature in a browser, and check the golden path plus one or two edge cases before reporting the task complete. If you cannot test the UI for some reason, say so explicitly instead of claiming success.
