---
paths:
  - "src/app/**/page.tsx"
---

# Page File Rules

- Page files must be THIN. Only rendering logic and data-fetching orchestration.
- Extract constants to `src/lib/constants/<domain>.ts`.
- Extract pure utility functions to `src/lib/utils/<domain>.ts`.
- Domain files (`dashboard.ts`, `orders.ts`, `menu.ts`) hold domain-specific code.
- Topic files (`date.ts`, `math.ts`, `status.ts`) hold helpers reused across domains.
- Server Components are default. Only add `"use client"` when browser APIs or interactivity are needed.
- Route-specific sub-components stay under `src/app/<route>/`; promote to `src/components/` only when reused.
