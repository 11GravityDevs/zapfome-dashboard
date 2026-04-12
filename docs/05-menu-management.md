# Screen 5 & 6 — Menu Management (Cardápio)

## Overview

Where the restaurant owner manages their menu: add/edit/remove items, toggle availability, manage flavors per item. Includes a modal form for creating and editing items.

**Screenshots**:
- `zapfome-screens/Screen 5 - Menu Management.webp` — Main list view
- `zapfome-screens/Screen 6 - Menu Item Form.webp` — Item form modal

---

## Route

`/cardapio`

---

## Layout — Main List

### Top Bar

- **Search input** (left): placeholder "Buscar um item...", filters items by name in real-time (client-side filter)
- **"+ Novo item"** button (right): primary variant, opens the item form modal in create mode

### Category Tabs

Horizontal row of filter tabs below the search:
- `Todos` (default — shows all items)
- One tab per distinct category from the menu items (e.g., `Pizzas`, `Hambúrgueres`, `Bebidas`, `Sobremesas`)
- `+ Mover categorias` — text/link button at the end (future feature: reorder categories)

Active tab: `--brand-primary` text + bottom border. Inactive: `--font-secondary`.

Categories are derived from the `menu_item.category` column — there is no separate categories table. The tab list is built dynamically from `SELECT DISTINCT category FROM menu_item WHERE tenant_id = :tenant_id ORDER BY MIN(sort_order)`.

### Items List

Items are grouped by category. Each category group has:

**Category header row:**
- Category name (18/600, `--font-primary`)
- "Editar" text button (right-aligned) — opens a small dropdown or inline edit for the category name (updates all items in that category)

**Item rows** (one per menu item, vertical stack):

Each item row contains:
- **Item name** (16/600, `--font-primary`)
- **Description** (12/400, `--font-secondary`) — below the name
- **Flavors section** (only if `allows_flavors = true`):
  - Label: "Sabores disponíveis" (12/500, `--font-secondary`)
  - Flavor chips/tags listed horizontally (12/400, `--font-primary`, `--radius-xs` background `--bg-secondary`)
  - `"+ Adicionar sabor"` text button — opens inline input or small modal to add a flavor
- **Price** (16/700, `--font-primary`, right-aligned): e.g., `R$ 42,90`
- **Availability toggle** (right-aligned): `Toggle` component. ON = available, OFF = unavailable
- **Row click / edit icon**: Clicking the item name or an edit icon opens the item form modal in edit mode

**Divider**: subtle `--border-light` between items.

---

## Layout — Item Form Modal (Screen 6)

Modal centered on screen (not drawer). Width ~480px.

### Header

- Title: "Novo item" (create mode) or "Editar item" (edit mode) — 20/600
- Close button (X)

### Form Fields

Vertical stack with gap `--spacing-md`:

| Field | Type | Label | Validation |
|---|---|---|---|
| Nome do item | `Input` text | "Nome do item" | Required |
| Descrição | `Input` textarea (2–3 rows) | "Descrição" | Optional |
| Preço (R$) | `Input` number | "Preço (R$)" | Required, > 0 |
| Categoria | `Input` select/dropdown | "Categoria" | Required. Options: existing categories + ability to type a new one |
| Permite sabores? | `Toggle` | "Permite sabores?" | Boolean |
| Qtd. máxima de sabores | `Input` number | "Qtd. máxima de sabores" | Only visible if "Permite sabores?" is on. Required when visible, ≥ 1 |
| Ordem de exibição | `Input` number | "Ordem de exibição" | Optional, defaults to 0 |

**Layout note**: "Preço" and "Categoria" are side by side (2 columns). "Qtd. máxima de sabores" and "Ordem de exibição" are also side by side.

### Footer Actions

- "Cancelar" — secondary button
- "Salvar" — primary button

---

## Data Requirements

### Queries

**All menu items with flavors:**

```typescript
const { data: items } = await supabase
  .from('menu_item')
  .select(`
    *,
    menu_item_flavor (*)
  `)
  .eq('tenant_id', tenantId)
  .order('sort_order', { ascending: true });
```

**Distinct categories (for tabs):**

Derived from the items query above — `[...new Set(items.map(i => i.category))]`.

### Mutations

**Create item:**

```typescript
const { data } = await supabase
  .from('menu_item')
  .insert({
    tenant_id: tenantId,
    name,
    description,
    price,
    category,
    allows_flavors: allowsFlavors,
    max_flavors: maxFlavors,
    sort_order: sortOrder,
    is_available: true,
  })
  .select()
  .single();
```

**Update item:**

```typescript
await supabase
  .from('menu_item')
  .update({ name, description, price, category, allows_flavors, max_flavors, sort_order })
  .eq('id', itemId)
  .eq('tenant_id', tenantId);
```

**Toggle availability:**

```typescript
await supabase
  .from('menu_item')
  .update({ is_available: !currentValue })
  .eq('id', itemId)
  .eq('tenant_id', tenantId);
```

**Delete item:**

```typescript
await supabase
  .from('menu_item')
  .delete()
  .eq('id', itemId)
  .eq('tenant_id', tenantId);
```

Delete requires confirmation: "Tem certeza que deseja excluir [item name]? Esta ação não pode ser desfeita."

**Add flavor:**

```typescript
await supabase
  .from('menu_item_flavor')
  .insert({
    tenant_id: tenantId,
    menu_item_id: itemId,
    name: flavorName,
    is_available: true,
    sort_order: nextSortOrder,
  });
```

**Remove flavor:**

```typescript
await supabase
  .from('menu_item_flavor')
  .delete()
  .eq('id', flavorId)
  .eq('tenant_id', tenantId);
```

**Toggle flavor availability:**

```typescript
await supabase
  .from('menu_item_flavor')
  .update({ is_available: !currentValue })
  .eq('id', flavorId)
  .eq('tenant_id', tenantId);
```

**Rename category** (updates all items in the category):

```typescript
await supabase
  .from('menu_item')
  .update({ category: newName })
  .eq('tenant_id', tenantId)
  .eq('category', oldName);
```

---

## Behavior & Interactions

- **Search**: Client-side filter. As the user types, filter the visible items by `name.toLowerCase().includes(query)`. Category groups with no matching items are hidden.
- **Category tabs**: Filter items to show only the selected category. "Todos" shows all.
- **Toggle availability**: Instant — no confirmation needed. Optimistically update the UI, then persist. Show a brief toast on success: "Item atualizado."
- **Flavor add**: Inline input appears below the flavor list. User types name, presses Enter or clicks a checkmark. Flavor appears in the list immediately.
- **Flavor remove**: Click an X on the flavor chip. No confirmation for flavors (they can be re-added easily).
- **Form submit**: Validate required fields, show inline errors. On success, close modal, refresh the list, show toast: "Item criado." / "Item atualizado."

---

## Components Used

- `Input` (search, form fields)
- `Button` (new item, save, cancel, delete)
- `Toggle` (availability)
- `Modal` (item form)
- `Badge` (category tabs — or simple styled tabs)

---

## Edge Cases

- **Empty menu**: Show centered empty state: "Seu cardápio está vazio. Clique em '+ Novo item' para começar."
- **Category with no items**: If all items in a category are deleted, the category tab disappears.
- **Duplicate item name**: Allowed — two items can have the same name in different categories.
- **Price formatting**: Input accepts numbers. Display as `R$ XX,XX`. Store as decimal in the DB.
- **Item with active orders**: Deleting an item that exists in active orders will fail due to FK constraint on `order_item.menu_item_id`. Show error: "Este item não pode ser excluído pois está vinculado a pedidos existentes. Desative-o em vez de excluir."
