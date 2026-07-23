<p align="center">
  <img src="public/logo.png" alt="Zapfome" width="96" />
</p>

<h1 align="center">Zapfome Dashboard</h1>

<p align="center">
  The web control panel restaurant owners use to run their WhatsApp ordering bot.
</p>

---

## What is Zapfome?

Zapfome is a WhatsApp-based food-ordering platform for small and medium restaurants in Brazil. Customers order directly in a WhatsApp chat with a bot; restaurant staff manage the whole operation (menu, live orders, delivery settings, payments) from this dashboard.

This repository is the **dashboard**, not the bot. It's a multi-tenant Next.js app built for a very specific user: a restaurant owner or manager who isn't especially technical, checking the screen between orders during the lunch or dinner rush. Every screen is optimized for that moment: large touch targets, no actions hidden behind hovers or tiny icons, everything in Brazilian Portuguese.

The WhatsApp bot itself lives in a separate service (`zapfome-backend`). Both projects share the same Supabase database: the dashboard reads and writes tenant data directly, and only calls out to the backend for the couple of actions that need to trigger a WhatsApp message or an external OAuth flow (see [Architecture](#architecture)).

## Features

- **Dashboard home**: today/week/month KPIs (orders, revenue, average ticket) with trend comparisons against the previous period, plus a top-products breakdown.
- **Orders (Kanban)**: live queue of incoming orders grouped by status, polled every 15 seconds. Advancing an order (preparing → ready → out for delivery → done) triggers the customer's WhatsApp notification through the bot.
- **Menu management**: categories, items, flavors/variants, pricing, and availability toggles, with image uploads for the menu itself.
- **Order history**: searchable, sortable, filterable (status, delivery type, payment method) table of past orders with pagination and export.
- **Settings**: business hours, delivery zones and fees, minimum order value, greeting/closed messages, and general establishment info.
- **Payments**: connect or disconnect a Mercado Pago account to accept Pix payments through the bot.
- **Connection**: pair the restaurant's WhatsApp number with the bot via QR code / pairing code.

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| UI | [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org) (strict), [Tailwind CSS v4](https://tailwindcss.com) |
| Data | [Supabase](https://supabase.com) (Postgres, Auth, Row-Level Security) |
| Icons | [Lucide](https://lucide.dev) |
| Dates | [date-fns](https://date-fns.org) with a PT-BR locale |
| Package manager | [Yarn](https://yarnpkg.com) |

## Architecture

- **Multi-tenancy.** Every restaurant is a `tenant`. A `tenant_user` table maps each authenticated Supabase user to their tenant, and every query is scoped to that `tenant_id`. Postgres Row-Level Security enforces the boundary at the database layer, not just in application code.
- **Auth.** Supabase Auth (email + password) with the session kept in cookies via `@supabase/ssr`. Route protection runs in `src/proxy.ts` (Next.js 16's take on middleware).
- **No backend API in this repo.** The dashboard talks to Supabase directly for reads and ordinary writes. The only calls to the separate `zapfome-backend` service are the actions that must go through the bot: order status transitions that send a WhatsApp message, the Mercado Pago OAuth handshake, and WhatsApp pairing, each authenticated with the user's own Supabase session token.
- **Live-ish updates.** No Supabase Realtime yet; the orders board polls on an interval, which keeps the architecture simple for now.

## Getting started

```bash
# install dependencies
yarn install

# copy the env template and fill in your own Supabase project
cp .env.local.example .env.local

# run the dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a Supabase project with the `tenant`, `tenant_user`, `order`, `menu_item`, and related tables (see `src/lib/types/database.ts` for the shapes this app expects) and RLS policies that scope every table to `tenant_id`.

### Other scripts

```bash
yarn build         # production build
yarn start         # serve the production build
yarn lint          # ESLint
yarn typecheck     # tsc --noEmit
yarn format        # Prettier
```

## Design system

All tokens (color, spacing, radii, type scale) are documented in [docs/design-system.md](docs/design-system.md) and implemented as CSS custom properties in `src/app/globals.css`. Nothing in the UI hardcodes a color or a spacing value; everything traces back to a named token.

## License

MIT. See [LICENSE](LICENSE).
