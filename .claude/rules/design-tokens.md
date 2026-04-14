---
paths:
  - "src/**/*.tsx"
---

# Design Token Rules

- NEVER hardcode colors, spacing, radii, font sizes, or shadows. Use CSS custom property tokens from `docs/design-system.md` / `src/app/globals.css`.
- If a token you need does not exist, STOP and ask — do not invent intermediate shades or sizes.
- If you change a token, update BOTH `src/app/globals.css` and `design.pen` (via pencil MCP) so they stay in sync.
- Every `<button>` must use `<Button>` from `@/components/button`. Every `<input>` must use `<Input>` from `@/components/input`. Same for Card, Badge, Toggle, Modal, Table, KpiCard.
- Status colors: blue=Novo, orange=Em preparo, green=Finalizado/Pago, red=Cancelado, neutral=default.
- All user-facing text must be PT-BR. No English fallbacks. Use proper accents (Configurações, Cardápio, Início).
- Currency/date/time/phone formatting must use helpers from `@/lib/format.ts` — never raw Intl or date-fns in components.
- Audience is non-technical and time-pressured: prefer large touch targets, never hide primary actions behind hover or tiny icons.
