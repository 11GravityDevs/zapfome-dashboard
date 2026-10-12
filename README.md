<p align="center">
  <img src="public/logo.png" alt="Zapfome" width="96" />
</p>

<h1 align="center">Zapfome Dashboard</h1>

<p align="center">
  The web control panel restaurant owners use to run their WhatsApp ordering bot.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
</p>

---

## Overview

Zapfome is a WhatsApp-based food-ordering platform for small and medium restaurants in Brazil. Customers order directly in a WhatsApp chat with a bot; restaurant staff manage the whole operation (menu, live orders, delivery settings, payments) from this dashboard.

This repository is the **dashboard**, not the bot. It is a multi-tenant Next.js app built for a very specific user: a restaurant owner or manager who isn't especially technical, checking the screen between orders during the lunch or dinner rush. Every screen is optimized for that moment: large touch targets, no actions hidden behind hovers or tiny icons, and everything in Brazilian Portuguese.

The WhatsApp bot lives in a separate service (`zapfome-backend`). Both projects share the same Supabase database: the dashboard reads and writes tenant data directly and only calls the backend for the few actions that must trigger a WhatsApp message or an external OAuth flow (see [Architecture](#architecture)).

## Features

- **Onboarding**: a new owner signs up, registers the establishment, and gets a WhatsApp connection provisioned in a single flow.
- **Dashboard home**: today/week/month KPIs (orders, revenue, average ticket) with trend comparisons against the previous period, plus a top-products breakdown.
- **Orders (Kanban)**: live queue of incoming orders grouped by status, refreshed every 15 seconds. Advancing an order (preparing, ready, out for delivery, done) sends the customer a WhatsApp notification through the bot.
- **Menu management**: categories, items, flavors/variants, pricing, and availability toggles, with image and PDF uploads for the menu itself.
- **Order history**: searchable, sortable, filterable (status, delivery type, payment method) table of past orders with pagination and export.
- **Settings**: business hours, delivery zones and fees, minimum order value, greeting/closed messages, and general establishment info.
- **Payments**: connect or disconnect a Mercado Pago account to accept Pix payments through the bot.
- **Connection**: pair the restaurant's WhatsApp number with the bot via QR code or pairing code.

## Tech stack

| Layer           | Technology                                                                |
| --------------- | ------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, React Server Components)                          |
| UI              | React 19, TypeScript (strict), Tailwind CSS v4                            |
| Data and auth   | Supabase (Postgres, Auth, Row Level Security) via `@supabase/ssr`         |
| Icons           | Lucide                                                                    |
| Dates           | date-fns with the PT-BR locale                                            |
| Tooling         | ESLint, Prettier, Yarn, Docker (standalone output)                        |

## Architecture

- **Multi-tenancy.** Every restaurant is a `tenant`. A `tenant_user` table maps each authenticated Supabase user to their tenant, and every query is scoped to that `tenant_id`. Postgres Row Level Security enforces the boundary at the database layer, not just in application code.
- **Auth.** Supabase Auth (email and password) with the session kept in cookies via `@supabase/ssr`. Route protection runs in `src/proxy.ts` (the Next.js 16 replacement for middleware).
- **No API layer in this repo.** The dashboard talks to Supabase directly for reads and ordinary writes. The only calls to `zapfome-backend` are actions that must go through the bot: onboarding provisioning, order status transitions that send a WhatsApp message, the Mercado Pago OAuth handshake, and WhatsApp pairing. Each one is authenticated with the user's own Supabase session token.
- **Near real-time updates.** The orders board polls on an interval instead of using Supabase Realtime, which keeps the architecture simple for now.
- **Design system.** All tokens (color, spacing, radii, type scale) are documented in [docs/design-system.md](docs/design-system.md) and implemented as CSS custom properties in `src/app/globals.css`. Nothing in the UI hardcodes a color or spacing value.

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login
│   ├── (onboarding)/    # Establishment setup for new owners
│   └── (dashboard)/     # Home, pedidos, cardapio, historico, configuracoes, pagamentos, conexao
├── components/          # Shared UI components and icons
├── contexts/            # React Context providers (tenant, toasts)
└── lib/
    ├── api/             # Calls to zapfome-backend
    ├── supabase/        # Browser and server Supabase clients
    ├── types/           # Database and domain types
    ├── constants/
    └── utils/
```

## Getting started

### Prerequisites

- Node.js 20+
- Yarn
- A Supabase project with the `tenant`, `tenant_user`, `order`, `menu_item`, and related tables (see `src/lib/types/database.ts` for the expected shapes) and RLS policies that scope every table to `tenant_id`

### Installation

```bash
git clone https://github.com/11GravityDevs/zapfome-dashboard.git
cd zapfome-dashboard
yarn install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BACKEND_URL=
```

Then start the dev server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `yarn dev`          | Start the development server  |
| `yarn build`        | Production build (standalone) |
| `yarn start`        | Serve the production build    |
| `yarn lint`         | Run ESLint                    |
| `yarn typecheck`    | Type-check with `tsc`         |
| `yarn format`       | Format with Prettier          |

## Deployment

`next.config.ts` uses `output: "standalone"`, and the included multi-stage `Dockerfile` (Node 22 Alpine, non-root user) packages that build into a small production image listening on port 3000.

## License

Distributed under the MIT license. See [LICENSE](LICENSE) for details.
