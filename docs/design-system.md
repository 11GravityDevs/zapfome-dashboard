# Zapfome Design System

> **Read this first — every front-end task.**
> The canonical visual source of truth lives in [design.pen](../design.pen), which is encrypted and only readable through the `pencil` MCP tools. This document mirrors that source so any agent can plan and write UI code without re-opening the editor. **Do not hardcode colors, spacing, radii, font sizes, or shadows** — always reference the token names below. If a value you need isn't documented here, stop and ask before inventing one. If you change a token, update both this file **and** `design.pen` so they stay in sync.

---

## 1. Brand & Tone

**Product.** Zapfome is a multi-tenant WhatsApp food-ordering platform used by small/medium restaurants in Brazil. This dashboard is the web tool restaurant owners use to run daily operations (orders, menu, settings) from a desktop or tablet — often during the lunch/dinner rush.

**Audience.** Brazilian restaurant owners and managers, generally not tech-savvy, working under time pressure. They need **speed, clarity, and large touch targets**. Never hide a primary action behind a hover, a long menu, or a tiny icon.

**Voice & tone.** Clean, modern, professional, warm. Friendly but never cute. All UI copy is **Brazilian Portuguese (PT-BR)** — no English fallbacks, no mixed-language labels.

**Wordmark.** "Zap" in `--font-primary` + "Fome" in `--brand-primary`, Inter 800, set as a single inline row. The icon mark is a chat bubble with a burger silhouette, tinted with the brand orange gradient.

---

## 2. Color Tokens

All colors are exposed as CSS custom properties using the names below. Hex values are the literal source of truth from `design.pen` — do not round, re-shade, or invent intermediate values.

### Brand
| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#F97316` | Primary CTAs, brand accents, focus rings |
| `--brand-primary-dark` | `#EA580C` | Hover / pressed state for primary |
| `--brand-primary-light` | `#FFF7ED` | Brand-tinted backgrounds, soft chips |

### Primary scale (orange)
`--primary-50` `#FFF7ED` · `--primary-100` `#FFEDD5` · `--primary-200` `#FED7AA` · `--primary-300` `#FDBA74` · `--primary-400` `#FB923C` · `--primary-500` `#F97316` · `--primary-600` `#EA580C` · `--primary-700` `#C2410C` · `--primary-800` `#9A3412` · `--primary-900` `#7C2D12`

### Neutral / dark scale (slate)
`--dark-50` `#F8FAFC` · `--dark-100` `#F1F5F9` · `--dark-200` `#E2E8F0` · `--dark-300` `#CBD5E1` · `--dark-400` `#94A3B8` · `--dark-500` `#64748B` · `--dark-600` `#475569` · `--dark-700` `#334155` · `--dark-800` `#1E293B` · `--dark-900` `#0F172A`

### Surfaces & backgrounds
| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | App background, default surface |
| `--bg-secondary` | `#F8F9FA` | Page background behind cards |
| `--bg-card` | `#FFFFFF` | Card / panel fills |
| `--bg-hover` | `#F1F5F9` | Row, card, button hover state |
| `--bg-modal-overlay` | `#00000066` | Modal/drawer scrim (≈ 40% black) |
| `--bg-sidebar` | `#1E293B` | Sidebar fill (dark slate) |
| `--surface-light` | `#FFFAF5` | Soft warm surface (alt page bg) |
| `--surface-dark` | `#0F172A` | Dark surface for inverted contexts |
| `--surface-card-dark` | `#253344` | Cards on dark surface |

### Borders
| Token | Hex | Usage |
|---|---|---|
| `--border` | `#E2E8F0` | Default 1px border on cards, inputs, dividers |
| `--border-light` | `#F1F5F9` | Subtle row dividers in tables |
| `--border-dark` | `#334155` | Borders inside dark/sidebar surfaces |

### Typography colors
| Token | Hex | Usage |
|---|---|---|
| `--font-primary` | `#1E293B` | Headings, body text, default text |
| `--font-secondary` | `#64748B` | Helper text, labels, placeholders, captions |
| `--font-white` | `#FFFFFF` | Text on brand / dark surfaces |
| `--font-sidebar` | `#CBD5E1` | Inactive sidebar items |
| `--font-sidebar-active` | `#FFFFFF` | Active sidebar item |
| `--font-dark-mode` | `#F1F5F9` | Default text on dark surface |
| `--font-dark-secondary` | `#94A3B8` | Secondary text on dark surface |

### Status — semantic
| Status | 50 | 100 | 500 | 600 | 700 |
|---|---|---|---|---|---|
| Success | `--success-50` `#F0FDF4` | `--success-100` `#DCFCE7` | `--success-500` `#22C55E` | `--success-600` `#16A34A` | `--success-700` `#15803D` |
| Info | `--info-50` `#EFF6FF` | `--info-100` `#DBEAFE` | `--info-500` `#3B82F6` | `--info-600` `#2563EB` | `--info-700` `#1D4ED8` |
| Warning | `--warning-50` `#FFFBEB` | `--warning-100` `#FEF3C7` | `--warning-500` `#F59E0B` | `--warning-600` `#D97706` | `--warning-700` `#B45309` |
| Error | `--error-50` `#FEF2F2` | `--error-100` `#FEE2E2` | `--error-500` `#EF4444` | `--error-600` `#DC2626` | `--error-700` `#B91C1C` |

### Status — accent aliases (used on cards, badges, kanban headers)
| Token | Hex | Usage |
|---|---|---|
| `--accent-green` | `#22C55E` | Pago, Finalizado, Pix, "Bot ativo" dot |
| `--accent-green-light` | `#F0FDF4` | Tinted background for green badges |
| `--accent-blue` | `#3B82F6` | Novo, info pills |
| `--accent-blue-light` | `#EFF6FF` | Tinted background for blue badges |
| `--accent-orange` | `#F97316` | Em preparo, Aguardando ação |
| `--accent-orange-light` | `#FFF7ED` | Tinted background for orange badges |
| `--accent-yellow` | `#EAB308` | Saiu p/ entrega, delivery status |
| `--accent-yellow-light` | `#FEFCE8` | Tinted background for yellow badges |
| `--accent-red` | `#EF4444` | Cancelar, erro, destructive |
| `--accent-red-light` | `#FEF2F2` | Tinted background for red badges |

### WhatsApp (phone link / WhatsApp affordances)
| Token | Hex | Usage |
|---|---|---|
| `--whatsapp-green` | `#25D366` | WhatsApp icon, "abrir no WhatsApp" link |
| `--whatsapp-dark` | `#128C7E` | WhatsApp pressed/hover |
| `--whatsapp-light` | `#DCF8C6` | Outgoing-message tint |
| `--whatsapp-bg` | `#E5DDD5` | WhatsApp chat background |

### Shadow base
| Token | Hex | Usage |
|---|---|---|
| `--shadow-color` | `#0000001A` | Base shadow color (≈ 10% black) |

---

## 3. Typography

**Family.** `Inter` is the only font family for the entire product. Fall back to `system-ui, sans-serif` if Inter is unavailable.

**Weights** (only these — don't introduce others):
- `400` normal — body text
- `500` medium — labels, helper text
- `600` semibold — buttons, section headings, badges
- `700` bold — page titles, KPI numbers
- `800` extrabold — brand wordmark only

**Size scale** (use the semantic name; the px is the actual value):

| Name | px | Use for |
|---|---|---|
| `text-xs` | 12 | Captions, footer, helper/error text, table headers, badge labels |
| `text-sm` | 14 | Body text, table cells, input text, sidebar items |
| `text-base` | 16 | Default body, button labels |
| `text-lg` | 18–20 | Section headings, card titles, modal headers |
| `text-xl` | 24 | Page titles, KPI numbers, brand wordmark |
| `text-2xl` | 28 | Large headings (rare — login screen, empty states) |

**Line height.** Use the font's default; only override when needed for tight numeric displays (KPI numbers can use `1.1`–`1.2`). Don't set `line-height` on single-line UI text.

**Casing.** Table column headers and overlines may be UPPERCASE 12/600 with `letter-spacing: 0.04em`. Everything else is sentence case in PT-BR.

---

## 4. Spacing

All spacing follows an **8px grid**. Use these tokens — never raw pixel values in component styles.

| Token | px | Typical use |
|---|---|---|
| `--spacing-2xs` | 2 | Hairline gap inside icons / chips |
| `--spacing-xs` | 4 | Tight inline gap, badge inner padding |
| `--spacing-sm` | 8 | Default gap between sibling elements |
| `--spacing-md` | 16 | Card inner gap, form field gap, input padding-x |
| `--spacing-lg` | 24 | Section gap, KPI card padding |
| `--spacing-xl` | 32 | Page section gap, modal padding |
| `--spacing-xxl` | 48 | Large vertical breathing room (login card, hero) |
| `--spacing-3xl` | 64 | Top-level page gutters at desktop |

**Page gutters.** Desktop content area uses 24–32px horizontal padding inside the main column. Mobile/tablet collapses to 16px.

---

## 5. Radius

| Token | px | Use for |
|---|---|---|
| `--radius-xs` | 4 | Tags, small chips, checkboxes |
| `--radius-sm` | 6 | Small buttons, inline pills |
| `--radius-md` | 8 | Buttons, inputs, order cards |
| `--radius-lg` | 12 | KPI cards, dropdowns |
| `--radius-xl` | 16 | Modals, drawers, login card, primary panels |
| `--radius-full` | 9999 | Pills, status badges, avatars, toggle tracks |

---

## 6. Shadows & Elevation

Three shadow recipes — pick the one that matches the surface, don't invent new ones.

| Name | CSS | Use for |
|---|---|---|
| Card | `0 2px 8px var(--shadow-color)` | Login card, modals, drawers, primary panels |
| Soft | `0 1px 3px rgba(0,0,0,0.08)` | KPI cards, kanban cards, dropdowns |
| Brand glow | `0 4px 13px rgba(249,115,22,0.25)` | Brand icon mark, hero brand element only |

Hover states should slightly raise an element (e.g. soft → card) rather than change color alone.

---

## 7. Layout Primitives

**Page shell** (Screens 2–7):
- **Sidebar:** fixed left, width 240px expanded / 64px collapsed, full height, fill `--bg-sidebar`. Items: 20px icon + label, 12px gap, 12–16px vertical padding per item, active item has brand-tint background and `--font-sidebar-active` text.
- **Top bar:** fixed top, height 64px, fill `--bg-card`, bottom border `--border` 1px. Contains restaurant name (16/600), bot status pill, user avatar.
- **Main content:** fill `--bg-secondary`, padding 24–32, vertical gap 24 between sections.

**Grid.** Always 8px. KPI rows use 4 equal columns at desktop, collapsing to 2 on tablet, 1 on mobile.

**Responsive.** Desktop-first. Touch targets must be **at least 32×32** (preferably 40×40 for primary actions) so the same UI works on a kitchen tablet. Sidebar collapses to icons on viewports < 1024px.

---

## 8. Components

Each spec lists the tokens that compose the component. Build new variants by composing tokens, not by adding new ones.

### Button
- **Primary.** Fill `--brand-primary`, text `--font-white` 16/600, radius `--radius-md`, padding `12 16`, height ≥ 40. Hover `--brand-primary-dark`. Disabled: `--dark-200` fill, `--dark-400` text.
- **Secondary.** Fill transparent, 1px stroke `--border`, text `--font-primary` 16/600, same radius/padding. Hover bg `--bg-hover`.
- **Red.** Fill `--error-500`, text `--font-white`. Hover `--error-600`.
- **Green.** Fill `--success-500`, text `--font-white`. Hover `--success-600`.
- **Blue.** Fill `--accent-blue`, text `--font-white`. Hover brightness 90%.
- **Orange.** Fill `--accent-orange`, text `--font-white`. Hover brightness 90%.
- **Yellow.** Fill `--accent-yellow`, text `--font-white`. Hover brightness 90%.
- **Text / link button.** No background, text `--brand-primary` 14/600. Use for "Editar", "Sabores", inline actions.
- **Full-width variant.** Set `width: 100%` (login "Entrar", form submits in modals).

### Input
- White (`--bg-card`) fill, 1px `--border` stroke, radius `--radius-md`, padding `12 16`, height ~44.
- Label above the input: `--font-secondary` 12/500, gap 6 to the field.
- Text inside: `--font-primary` 14/normal. Placeholder: `--font-secondary`.
- Focus: 2px `--brand-primary` ring, border becomes `--brand-primary`.
- Error: 1px `--accent-red` border, helper text `--accent-red` 12/500 below.

### Select
- Custom dropdown (not native `<select>`). Trigger button + floating options list.
- **Trigger:** same visual treatment as Input — white (`--bg-card`) fill, 1px `--border` stroke, radius `--radius-md`, height ~44, padding `12 16`. Text `--font-primary` 14/normal. Placeholder text `--font-secondary`.
- Trailing chevron (ChevronDown, 16, `--font-secondary`), rotates 180° when open.
- Focus / open: 2px `--brand-primary` ring, border becomes `--brand-primary`.
- **Dropdown panel:** `--bg-card` fill, 1px `--border`, radius `--radius-md`, Card shadow, `z-index: 50`, max-height 240, overflow auto, padding-y 4.
- **Option item:** padding `10 16`, text `--font-primary` 14/normal, `cursor-pointer`. Hover/focused: bg `--bg-hover`. Selected: `--brand-primary` text + font-medium + trailing Check icon (16).
- Label above (optional): `--font-secondary` 12/500, gap 6.
- Error: 1px `--accent-red` border, helper text `--accent-red` 12/500 below.
- Keyboard: Arrow keys navigate, Enter/Space select, Escape closes. ARIA combobox + listbox pattern.

### Card (generic)
- Fill `--bg-card`, radius `--radius-lg`, 1px `--border` stroke optional, padding `--spacing-lg` (24), Soft shadow.
- Inner gap `--spacing-md` (16).

### KPI Card
- Generic Card + leading icon (24px) in a `--brand-primary-light` round square.
- Label: `--font-secondary` 14/500.
- Value: `--font-primary` 24/700, line-height 1.1.
- "Aguardando ação" variant: `--accent-orange-light` background or 1px `--accent-orange` border.

### Order Card (Kanban)
- Fill `--bg-card`, radius `--radius-md`, 1px `--border`, padding `--spacing-md` (16), Soft shadow, inner gap `--spacing-sm` (8).
- Hover: lift to Card shadow, bg `--bg-hover`.
- Header row: order number (`#42`) 14/700 + payment badge.
- Customer name 14/600, type badge (Entrega/Retirada).
- Time 12 `--font-secondary` + total 16/700 `--font-primary`.
- Action button at bottom, right-aligned (not full-width), single-word label, colored to match its column: blue (Aceitar), orange (Pronto), green (Entrega), yellow (Finalizar).
- "Finalizados" column variant: opacity 0.85, no action button.

### Kanban Column
- Width 320–360px, vertical gap 12 between cards.
- Header bar: 8px tall colored strip + title 14/700:
  - Para aceitar → `--accent-blue`
  - Em preparo → `--accent-orange`
  - Prontos → `--accent-green`
  - Saiu p/ entrega → `--accent-yellow`
  - Finalizados → `--dark-300`
- Counter chip in matching `*-light` tint.

### Badge / Status Pill
- Padding `4 8`, radius `--radius-full`, font 12/600, single line.
- Light tint background + matching darker text:
  - Pago / Pix / Finalizado → `--accent-green-light` bg, `--accent-green` text
  - Novo → `--accent-blue-light` bg, `--accent-blue` text
  - Em preparo / Aguardando ação → `--accent-orange-light` bg, `--accent-orange` text
  - Cancelado / Erro → `--accent-red-light` bg, `--accent-red` text
  - Na entrega / Neutro → `--bg-secondary` bg, `--font-secondary` text

### Table
- Header row: `--font-secondary` 12/600 UPPERCASE, padding `12 16`, bottom border `--border`.
- Body row: `--font-primary` 14/normal, padding `12 16`, divider `--border-light`.
- Hover row: `--bg-hover`.
- Row click is the entire row's tap target (cursor pointer).
- Numeric columns right-aligned; status columns center-aligned.

### Modal / Drawer
- Overlay: `--bg-modal-overlay`.
- Panel: `--bg-card`, radius `--radius-xl`, padding `--spacing-xl` (32), Card shadow.
- Header row: title 20/600 + close button (X icon, 24, `--font-secondary`), divider `--border` below.
- Footer actions: right-aligned, primary on the right. Destructive uses outline variant on the left.
- Drawer variant: pinned right, full height, width 480–560px.

### Toggle Switch
- Track: 32×18, radius `--radius-full`. Off: `--border`. On: `--brand-primary`.
- Thumb: 14×14, white, soft shadow, 2px inset.
- Use for availability (on/off) on menu items, "Bot ativo", "Fechado" per day. Always large enough to tap.

### Toast
Floating notification for backend/submit feedback. Appears top-right, stacked downward.

- **Container:** fixed top-right, `right: --spacing-lg` (24), `top: --spacing-lg` (24), `z-index: 60`, max-width 420px, min-width 320px.
- **Panel:** fill variant 500 (solid), no border, radius `--radius-lg` (12), padding `--spacing-md` (16), Soft shadow. All text and icons are `--font-white`.
- **Layout:** horizontal row, vertically centered (`items-center`): 20px Lucide icon (shrink-0) + text column + close button (X, 16px).
- **Text:** title 14/600 `--font-white`. Optional description 12/400 `--font-white` at 90% opacity, gap `--spacing-2xs` (2) below title.
- **Close button:** X icon 16px, `--font-white` at 70% opacity, hover full `--font-white`. Touch target 32×32.
- **Animation:** slide in from right (translateX 100% → 0) + fade in (opacity 0 → 1), 200ms ease-out. Dismiss: fade out (opacity → 0), 150ms ease-in.
- **Auto-dismiss:** 5000ms default. Error variant: 7000ms. Pause timer on hover.
- **Stacking:** gap `--spacing-sm` (8) between toasts, max 3 visible. Oldest evicted when exceeding max.
- **Variants:**

| Variant | Background | Text / Icon | Lucide icon |
|---|---|---|---|
| `error` | `--error-500` | `--font-white` | `CircleAlert` |
| `success` | `--success-500` | `--font-white` | `CircleCheck` |
| `warning` | `--warning-500` | `--font-white` | `TriangleAlert` |
| `info` | `--info-500` | `--font-white` | `Info` |

- **Accessibility:** `role="alert"` + `aria-live="assertive"` for error/warning. `aria-live="polite"` for success/info. Close button `aria-label="Fechar"`.
- **Usage pattern:** inline input errors for field validation; toasts for backend/submit errors (POST, UPDATE, DELETE failures).

### Sidebar (Navigation)
- Fill `--bg-sidebar`, item gap 4, item padding `12 16`.
- Icon (Lucide, 20) + label 14/500, color `--font-sidebar`.
- Active item: bg `--brand-primary` 12% (or `--brand-primary-dark` solid stripe on the left), text `--font-sidebar-active`, icon white.
- Brand wordmark sits at the top with 24px padding.

### Top Bar
- Fill `--bg-card`, height 64, bottom border `--border`, padding `0 24`.
- Left: restaurant name 16/600 `--font-primary`.
- Center/right: bot status pill (`--accent-green` dot + "Bot ativo" 12/600).
- Far right: avatar (32×32, radius `--radius-full`) + user menu chevron.

---

## 9. Iconography

- **Library:** Lucide (matches the .pen `iconFontFamily: "lucide"`). If Lucide isn't available, fall back to Feather — never mix multiple icon libraries in one screen.
- **Stroke weight:** 1.5 (Lucide default).
- **Sizes:**
  - 16 — inline next to text (table cell, badge)
  - 20 — sidebar items, secondary buttons
  - 24 — KPI cards, top bar, modal close
  - 32 — empty states, large feature icons
- **Color:** inherit from text color (`currentColor`). Don't hardcode icon fills.
- **Touch targets:** wrap clickable icons in a 32×32 (min) or 40×40 padded box.

---

## 10. Status Color Mapping (cheat sheet)

| Domain status | PT-BR label | Token group |
|---|---|---|
| New order | `Novo` / `Novos` | `--accent-blue` / `--info-*` |
| In preparation | `Em preparo` | `--accent-orange` / `--warning-*` |
| Done | `Finalizado` / `Finalizados` | `--accent-green` / `--success-*` |
| Cancelled | `Cancelado` | `--accent-red` / `--error-*` |
| Needs action | `Aguardando ação` | `--accent-orange` |
| Paid (Pix) | `Pix` / `Pago` | `--accent-green` |
| Cash on delivery | `Na entrega` | `--bg-secondary` / `--font-secondary` |
| Bot active | `Bot ativo` | `--accent-green` |
| Bot inactive | `Bot inativo` | `--font-secondary` |
| Item available | toggle on | `--brand-primary` |
| Item unavailable | toggle off | `--border` |

---

## 11. Locale & Content Rules

- **Language.** All UI copy in Brazilian Portuguese (PT-BR). No English fallbacks, no mixed-language labels. Accents and cedilhas are required where the word demands them: `Configurações`, `Cardápio`, `Visão geral`, `Ação`, `Endereço`, `Início`.
- **Currency.** Brazilian Real with the format `R$ 1.234,56`:
  - Period as thousands separator
  - Comma as decimal separator
  - Non-breaking space between `R$` and the number
  - Always two decimal places, even for round amounts (`R$ 25,00`)
- **Phone.** `(XX) XXXXX-XXXX` for mobile, `(XX) XXXX-XXXX` for landline. Display only — never strip the formatting.
- **Dates.** `DD/MM/YYYY`. Times in 24h `HH:mm`. Combined: `10/04/2026 12:30`.
- **Sample / placeholder data must be Brazilian:**
  - Names: Maria Silva, João Santos, Ana Oliveira, Carlos Souza
  - Foods: Pizza, Hambúrguer, Açaí, Coxinha, Pastel, Coca-Cola, Guaraná
  - Neighborhoods: Centro, Jardins, Vila Mariana, Pinheiros, Moema
  - Cities: São Paulo, Rio de Janeiro, Belo Horizonte
- **Empty / loading / error copy** must also be in PT-BR. Examples: `Nenhum pedido por aqui ainda.`, `Carregando…`, `Não foi possível carregar os pedidos.`

---

## 12. Implementation Hints

This document is **framework-agnostic** on purpose. When wiring tokens into the codebase:

- Expose every token above as a CSS custom property using the **same `--token-name`** so the doc and the code share one vocabulary. Define them on `:root` in a single global stylesheet.
- If you adopt Tailwind, map the tokens through `theme.extend.colors`, `theme.extend.spacing`, etc. — keep the keys identical to the token names so a designer reading this doc and an engineer reading the Tailwind config see the same vocabulary.
- Component primitives (Button, Input, Card, Badge, etc.) should be implemented once as reusable React components and consumed everywhere — never inline an ad-hoc `<button>` with hand-rolled classes.
- This repo uses a non-stock version of Next.js. Before writing any framework-specific code, read [AGENTS.md](../AGENTS.md) and the relevant guide in `node_modules/next/dist/docs/`. **Don't assume stock Next.js APIs.**
- Don't introduce a new component library (MUI, Chakra, Radix-ui-as-styled, etc.) without explicit approval — the design above is intentionally lightweight and shouldn't pull in opinionated styles.

---

## 13. Source of Truth & Sync Rule

[design.pen](../design.pen) is the canonical visual reference. This document is a faithful mirror of it, intended for agents and humans who can't open the .pen file during coding.

**Never** change a token here without also updating `design.pen`, and **never** introduce a token in code that doesn't exist in both this doc and `design.pen`. The three sources — `design.pen`, this doc, and the global stylesheet — must always agree.
