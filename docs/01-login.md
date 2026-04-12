# Screen 1 — Login

## Overview

Entry point for restaurant owners. Simple email + password form centered on the page. No registration — accounts are created directly in Supabase by the Zapfome team when onboarding a restaurant.

**Screenshot**: `zapfome-screens/Screen 1 - Login.webp`

---

## Route

`/login` — inside the `(auth)` route group (no sidebar, no top bar).

---

## Layout

Full-page centered layout:

- Background: `--bg-secondary`
- Content is vertically and horizontally centered

**Top section:**
- ZapFome icon mark (chat bubble with burger, 80x80, orange rounded square with brand glow shadow)
- Wordmark below: "Zap" in `--font-primary` + "Fome" in `--brand-primary`, Inter 800

**Card** (centered, max-width ~440px):
- Background: `--bg-card`, radius `--radius-xl`, Card shadow, padding `--spacing-xl`
- Title: "Acesse seu painel" — 20/600, `--font-primary`, centered
- Form fields (vertical stack, gap `--spacing-md`):
  1. **E-mail** — `Input` component, type `email`, placeholder `seu@email.com`
  2. **Senha** — `Input` component, type `password`
- **Entrar** button — `Button` primary, full-width, margin-top `--spacing-md`
- Footer text: "Zapfome © 2026" — 12/400, `--font-secondary`, centered, margin-top `--spacing-lg`

---

## Behavior

### Login flow

1. User fills email and password, clicks "Entrar"
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. On success: redirect to `/` (dashboard home)
4. On error: show inline error message below the form

### Error handling

- Invalid credentials: "E-mail ou senha incorretos."
- Network error: "Não foi possível conectar. Tente novamente."
- Empty fields: HTML5 `required` validation (no custom logic needed)

### Loading state

- "Entrar" button shows a loading spinner and is disabled during the auth request

### Already authenticated

- Auth middleware redirects authenticated users from `/login` to `/` automatically

---

## Data Requirements

### Auth call

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

No database queries — Supabase Auth handles everything. The tenant resolution happens after redirect, inside the dashboard layout.

---

## Components Used

- `Input` (x2 — email, password)
- `Button` (primary, full-width)

---

## Edge Cases

- **Disabled account**: If the `tenant.is_active` is `false`, the user can log in (auth succeeds) but the dashboard layout should show an error: "Sua conta está desativada. Entre em contato com o suporte."
- **No tenant mapping**: If `tenant_user` has no row for this `auth.uid()`, show: "Nenhum estabelecimento vinculado a esta conta."
- **Session expiry**: Handled by the auth middleware — user is redirected to `/login` automatically.
