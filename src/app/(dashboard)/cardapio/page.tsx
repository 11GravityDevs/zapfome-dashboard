"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Spinner } from "@/components/spinner";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem, MenuItemFlavor } from "@/lib/types/database";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { MenuItemRow } from "./menu-item-row";
import { MenuItemFormModal } from "./menu-item-form-modal";
import { NewCategoryModal } from "./new-category-modal";
import { RenameCategoryModal } from "./rename-category-modal";

export type MenuItemWithFlavors = MenuItem & {
  menu_item_flavor: MenuItemFlavor[];
};

export default function CardapioPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [items, setItems] = useState<MenuItemWithFlavors[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<MenuItemWithFlavors | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItemWithFlavors | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingFlavor, setDeletingFlavor] = useState<MenuItemFlavor | null>(null);
  const [deletingFlavorLoading, setDeletingFlavorLoading] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renamingCategoryLoading, setRenamingCategoryLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const fetchIdRef = useRef(0);
  const refetchRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      const id = ++fetchIdRef.current;

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("menu_item")
          .select("*, menu_item_flavor (*)")
          .eq("tenant_id", tenantId);

        if (cancelled || id !== fetchIdRef.current) return;

        if (error) {
          console.error("[Cardapio] Fetch items error:", error);
          showToast({ variant: "error", title: "Não foi possível carregar o cardápio." });
          setLoading(false);
          return;
        }

        setItems((data as MenuItemWithFlavors[]) ?? []);
        setLoading(false);
      } catch (err) {
        console.error("[Cardapio] Unexpected error:", err);
        if (!cancelled && id === fetchIdRef.current) {
          showToast({ variant: "error", title: "Não foi possível carregar o cardápio." });
          setLoading(false);
        }
      }
    }

    refetchRef.current = fetchItems;
    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [tenantId, showToast]);

  const categories = [...new Set([...items.map((i) => i.category), ...customCategories])];

  const filtered = items.filter((item) => {
    if (activeCategory && item.category !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: filtered.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  async function handleToggleAvailability(item: MenuItemWithFlavors) {
    const newValue = !item.is_available;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: newValue } : i)));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item")
        .update({ is_available: newValue })
        .eq("id", item.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[Cardapio] Toggle availability error:", error);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_available: !newValue } : i)),
        );
        showToast({ variant: "error", title: "Não foi possível atualizar o item." });
        return;
      }

      showToast({
        variant: newValue ? "success" : "warning",
        title: newValue ? `Item "${item.name}" ativado.` : `Item "${item.name}" desativado.`,
      });
    } catch (err) {
      console.error("[Cardapio] Unexpected toggle error:", err);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: !newValue } : i)),
      );
      showToast({ variant: "error", title: "Não foi possível atualizar o item." });
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;

    setDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item")
        .delete()
        .eq("id", deletingItem.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[Cardapio] Delete item error:", error);
        if (error.code === "23503") {
          showToast({
            variant: "error",
            title:
              "Este item não pode ser excluído pois está vinculado a pedidos existentes. Desative-o em vez de excluir.",
          });
        } else {
          showToast({ variant: "error", title: "Não foi possível excluir o item." });
        }
        setDeleting(false);
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      showToast({ variant: "success", title: "Item excluído." });
      setDeletingItem(null);
      setDeleting(false);
    } catch (err) {
      console.error("[Cardapio] Unexpected delete error:", err);
      showToast({ variant: "error", title: "Não foi possível excluir o item." });
      setDeleting(false);
    }
  }

  async function handleToggleFlavor(flavor: MenuItemFlavor) {
    const newValue = !flavor.is_available;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        menu_item_flavor: item.menu_item_flavor.map((f) =>
          f.id === flavor.id ? { ...f, is_available: newValue } : f,
        ),
      })),
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item_flavor")
        .update({ is_available: newValue })
        .eq("id", flavor.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[Cardapio] Toggle flavor error:", error);
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            menu_item_flavor: item.menu_item_flavor.map((f) =>
              f.id === flavor.id ? { ...f, is_available: !newValue } : f,
            ),
          })),
        );
        showToast({ variant: "error", title: "Não foi possível atualizar o sabor." });
        return;
      }

      showToast({
        variant: newValue ? "success" : "warning",
        title: newValue ? `Sabor "${flavor.name}" ativado.` : `Sabor "${flavor.name}" desativado.`,
      });
    } catch (err) {
      console.error("[Cardapio] Unexpected flavor toggle error:", err);
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          menu_item_flavor: item.menu_item_flavor.map((f) =>
            f.id === flavor.id ? { ...f, is_available: !newValue } : f,
          ),
        })),
      );
      showToast({ variant: "error", title: "Não foi possível atualizar o sabor." });
    }
  }

  async function handleAddFlavor(itemId: string, name: string, price: number | null) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("menu_item_flavor")
        .insert({
          tenant_id: tenantId,
          menu_item_id: itemId,
          name,
          price,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        console.error("[Cardapio] Add flavor error:", error);
        showToast({ variant: "error", title: "Não foi possível adicionar o sabor." });
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, menu_item_flavor: [...i.menu_item_flavor, data as MenuItemFlavor] }
            : i,
        ),
      );
    } catch (err) {
      console.error("[Cardapio] Unexpected add flavor error:", err);
      showToast({ variant: "error", title: "Não foi possível adicionar o sabor." });
    }
  }

  async function handleEditFlavor(flavorId: string, name: string, price: number | null) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item_flavor")
        .update({ name, price })
        .eq("id", flavorId)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[Cardapio] Edit flavor error:", error);
        showToast({ variant: "error", title: "Não foi possível atualizar o sabor." });
        return;
      }

      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          menu_item_flavor: item.menu_item_flavor.map((f) =>
            f.id === flavorId ? { ...f, name, price } : f,
          ),
        })),
      );
      showToast({ variant: "success", title: "Sabor atualizado." });
    } catch (err) {
      console.error("[Cardapio] Unexpected edit flavor error:", err);
      showToast({ variant: "error", title: "Não foi possível atualizar o sabor." });
    }
  }

  async function handleConfirmFlavorDelete() {
    if (!deletingFlavor) return;
    setDeletingFlavorLoading(true);
    await handleRemoveFlavor(deletingFlavor);
    setDeletingFlavor(null);
    setDeletingFlavorLoading(false);
  }

  async function handleRemoveFlavor(flavor: MenuItemFlavor) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item_flavor")
        .delete()
        .eq("id", flavor.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[Cardapio] Remove flavor error:", error);
        showToast({ variant: "error", title: "Não foi possível remover o sabor." });
        return;
      }

      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          menu_item_flavor: item.menu_item_flavor.filter((f) => f.id !== flavor.id),
        })),
      );
    } catch (err) {
      console.error("[Cardapio] Unexpected remove flavor error:", err);
      showToast({ variant: "error", title: "Não foi possível remover o sabor." });
    }
  }

  async function handleRenameCategory(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingCategory(null);
      return;
    }

    setRenamingCategoryLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item")
        .update({ category: trimmed })
        .eq("tenant_id", tenantId)
        .eq("category", oldName);

      if (error) {
        console.error("[Cardapio] Rename category error:", error);
        showToast({ variant: "error", title: "Não foi possível renomear a categoria." });
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.category === oldName ? { ...item, category: trimmed } : item)),
      );
      setCustomCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
      if (activeCategory === oldName) setActiveCategory(trimmed);
      setRenamingCategory(null);
      showToast({ variant: "success", title: "Categoria renomeada." });
    } catch (err) {
      console.error("[Cardapio] Unexpected rename category error:", err);
      showToast({ variant: "error", title: "Não foi possível renomear a categoria." });
    } finally {
      setRenamingCategoryLoading(false);
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return;

    const categoryItems = items.filter((i) => i.category === deletingCategory);

    if (categoryItems.length === 0) {
      setCustomCategories((prev) => prev.filter((c) => c !== deletingCategory));
      setDeletingCategory(null);
      if (activeCategory === deletingCategory) setActiveCategory(null);
      showToast({ variant: "success", title: "Categoria removida." });
      return;
    }

    setDeletingCategoryLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("menu_item")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("category", deletingCategory);

      if (error) {
        console.error("[Cardapio] Delete category error:", error);
        showToast({ variant: "error", title: "Não foi possível excluir a categoria." });
        return;
      }

      setItems((prev) => prev.filter((i) => i.category !== deletingCategory));
      setCustomCategories((prev) => prev.filter((c) => c !== deletingCategory));
      if (activeCategory === deletingCategory) setActiveCategory(null);
      showToast({ variant: "success", title: "Categoria excluída." });
      setDeletingCategory(null);
    } catch (err) {
      console.error("[Cardapio] Unexpected delete category error:", err);
      showToast({ variant: "error", title: "Não foi possível excluir a categoria." });
    } finally {
      setDeletingCategoryLoading(false);
    }
  }

  function openCreateModal() {
    setModalItem(null);
    setModalOpen(true);
  }

  function openEditModal(item: MenuItemWithFlavors) {
    setModalItem(item);
    setModalOpen(true);
  }

  function handleModalSaved() {
    setModalOpen(false);
    setModalItem(null);
    refetchRef.current();
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-font-primary">Cardápio</h1>
          <Button leadingIcon={<Plus size={16} />} disabled>
            Novo item
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-80">
            <Input placeholder="Buscar um item..." disabled leadingIcon={<Search size={16} />} />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-font-primary">Cardápio</h1>
        <Button leadingIcon={<Plus size={16} />} onClick={openCreateModal}>
          Novo item
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Buscar um item..."
            maxLength={100}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search size={16} />}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            activeCategory === null
              ? "bg-brand-primary text-font-white"
              : "border border-border text-font-secondary hover:bg-bg-hover",
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === cat
                ? "bg-brand-primary text-font-white"
                : "border border-border text-font-secondary hover:bg-bg-hover",
            )}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCategoryModalOpen(true)}
          className="flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary-light"
        >
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-center text-sm text-font-secondary">
            Seu cardápio está vazio. Clique em &quot;+ Novo item&quot; para começar.
          </p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-sm text-font-secondary">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-font-primary">{group.category}</h2>
                <span className="text-sm font-semibold text-brand-primary">
                  {group.items.length} {group.items.length === 1 ? "item" : "itens"}
                </span>
                <button
                  type="button"
                  onClick={() => setRenamingCategory(group.category)}
                  className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-brand-primary"
                  aria-label={`Renomear ${group.category}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingCategory(group.category)}
                  className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-accent-red"
                  aria-label={`Excluir ${group.category}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-bg-card">
                {group.items.map((item, index) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    showDivider={index > 0}
                    onToggleAvailability={() => handleToggleAvailability(item)}
                    onEdit={() => openEditModal(item)}
                    onDelete={() => setDeletingItem(item)}
                    onFlavorToggle={handleToggleFlavor}
                    onFlavorAdd={handleAddFlavor}
                    onFlavorEdit={handleEditFlavor}
                    onFlavorRemove={(flavor) => setDeletingFlavor(flavor)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalItem(null);
        }}
        item={modalItem}
        categories={categories}
        tenantId={tenantId}
        onSaved={handleModalSaved}
      />

      <DeleteConfirmModal
        open={Boolean(deletingItem)}
        itemName={deletingItem?.name ?? ""}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingItem(null)}
      />

      <DeleteConfirmModal
        open={Boolean(deletingFlavor)}
        itemName={deletingFlavor?.name ?? ""}
        loading={deletingFlavorLoading}
        onConfirm={handleConfirmFlavorDelete}
        onClose={() => setDeletingFlavor(null)}
        title="Excluir sabor"
      />

      <NewCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        existingCategories={categories}
        onConfirm={(name) => {
          setCustomCategories((prev) => [...prev, name]);
          setCategoryModalOpen(false);
          showToast({ variant: "success", title: "Categoria adicionada." });
        }}
      />

      <DeleteConfirmModal
        open={deletingCategory !== null}
        itemName={deletingCategory ?? ""}
        loading={deletingCategoryLoading}
        onConfirm={handleDeleteCategory}
        onClose={() => setDeletingCategory(null)}
        title="Excluir categoria"
        description={
          deletingCategory
            ? `Tem certeza que deseja excluir a categoria "${deletingCategory}" e todos os seus itens? Esta ação não pode ser desfeita.`
            : ""
        }
      />

      <RenameCategoryModal
        open={renamingCategory !== null}
        onClose={() => setRenamingCategory(null)}
        currentName={renamingCategory ?? ""}
        existingCategories={categories}
        loading={renamingCategoryLoading}
        onConfirm={(newName) => {
          if (renamingCategory) {
            handleRenameCategory(renamingCategory, newName);
          }
        }}
      />
    </div>
  );
}
