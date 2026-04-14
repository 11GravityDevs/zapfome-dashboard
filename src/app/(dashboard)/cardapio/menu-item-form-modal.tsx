"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/button";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Select } from "@/components/select";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";
import type { MenuItemWithFlavors } from "./page";

type MenuItemFormModalProps = {
  open: boolean;
  onClose: () => void;
  item: MenuItemWithFlavors | null;
  categories: string[];
  tenantId: string;
  onSaved: () => void;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  allowsFlavors: boolean;
  maxFlavors: string;
  flavors: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function priceToCents(decimalPrice: number): string {
  const cents = Math.round(decimalPrice * 100);
  return cents > 0 ? String(cents) : "";
}

export function MenuItemFormModal({
  open,
  onClose,
  item,
  categories,
  tenantId,
  onSaved,
}: MenuItemFormModalProps) {
  const { showToast } = useToast();
  const isEditing = Boolean(item);

  const [form, setForm] = useState<FormData>(getInitialForm(item));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState("");
  const [newFlavorError, setNewFlavorError] = useState("");

  if (open && !prevOpen) {
    setPrevOpen(true);
    setForm(getInitialForm(item));
    setErrors({});
    setNewFlavorName("");
    setNewFlavorError("");
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleAddModalFlavor() {
    const trimmed = newFlavorName.trim();
    if (!trimmed) {
      setNewFlavorError("Nome do sabor é obrigatório.");
      return;
    }
    if (form.flavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setNewFlavorError("Esse sabor já existe.");
      return;
    }
    updateField("flavors", [...form.flavors, trimmed]);
    setNewFlavorName("");
    setNewFlavorError("");
  }

  function handleRemoveModalFlavor(index: number) {
    updateField(
      "flavors",
      form.flavors.filter((_, i) => i !== index),
    );
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório.";
    if (!form.price || Number(form.price) <= 0)
      errs.price = "Preço deve ser maior que zero.";
    if (!form.category.trim()) errs.category = "Categoria é obrigatória.";
    if (
      form.allowsFlavors &&
      (!form.maxFlavors || Number(form.maxFlavors) < 1)
    ) {
      errs.maxFlavors = "Mínimo de 1 sabor.";
    }
    if (form.allowsFlavors && !isEditing && form.flavors.length === 0) {
      errs.flavors = "Adicione pelo menos um sabor.";
    }
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) / 100,
        category: form.category.trim(),
        allows_flavors: form.allowsFlavors,
        max_flavors: form.allowsFlavors ? Number(form.maxFlavors) : 0,
      };

      if (isEditing && item) {
        const { error } = await supabase
          .from("menu_item")
          .update(payload)
          .eq("id", item.id)
          .eq("tenant_id", tenantId);

        if (error) {
          console.error("[MenuItemForm] Update error:", error);
          showToast({
            variant: "error",
            title: "Não foi possível atualizar o item.",
          });
          return;
        }

        showToast({ variant: "success", title: "Item atualizado." });
      } else {
        const { data: newItem, error } = await supabase
          .from("menu_item")
          .insert({
            ...payload,
            tenant_id: tenantId,
            is_available: true,
          })
          .select("id")
          .single();

        if (error) {
          console.error("[MenuItemForm] Insert error:", error);
          showToast({
            variant: "error",
            title: "Não foi possível criar o item.",
          });
          return;
        }

        if (form.flavors.length > 0) {
          const flavorRows = form.flavors.map((name, idx) => ({
            tenant_id: tenantId,
            menu_item_id: newItem.id,
            name,
            is_available: true,
            sort_order: idx,
          }));

          const { error: flavorError } = await supabase
            .from("menu_item_flavor")
            .insert(flavorRows);

          if (flavorError) {
            console.error("[MenuItemForm] Flavor insert error:", flavorError);
            showToast({
              variant: "warning",
              title: "Item criado, mas houve erro ao salvar os sabores.",
            });
            onSaved();
            return;
          }
        }

        showToast({ variant: "success", title: "Item criado." });
      }

      onSaved();
    } catch (err) {
      console.error("[MenuItemForm] Unexpected error:", err);
      showToast({
        variant: "error",
        title: "Erro inesperado ao salvar o item.",
      });
    } finally {
      setSaving(false);
    }
  }

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar item" : "Novo item"}
      locked={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nome do item"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          maxLength={100}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-font-secondary">
            Descrição
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Descrição do item"
            className="resize-none rounded-md border border-border bg-bg-card px-4 py-3 text-sm text-font-primary outline-none transition-colors placeholder:text-font-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            label="Preço"
            value={form.price}
            onChange={(cents) => updateField("price", cents)}
            error={errors.price}
          />

          <Select
            label="Categoria"
            value={form.category}
            onChange={(val) => updateField("category", val)}
            options={categoryOptions}
            placeholder="Selecione"
            error={errors.category}
          />
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={form.allowsFlavors}
            onCheckedChange={(v) => updateField("allowsFlavors", v)}
            label="Permitir sabores"
          />
          <span className="text-sm text-font-primary">Permitir sabores</span>
        </div>

        {form.allowsFlavors && (
          <Input
            label="Qtd. máxima de sabores"
            type="number"
            min={1}
            max={20}
            step={1}
            value={form.maxFlavors}
            onChange={(e) => updateField("maxFlavors", e.target.value)}
            error={errors.maxFlavors}
          />
        )}

        {form.allowsFlavors && !isEditing && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-font-secondary">
              Sabores
            </label>

            <div className="flex flex-wrap gap-2">
              {form.flavors.map((flavor, index) => (
                <div
                  key={index}
                  className="flex w-fit items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 py-2"
                >
                  <span className="text-sm text-font-primary">{flavor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveModalFlavor(index)}
                    className="cursor-pointer text-font-secondary transition-colors hover:text-accent-red"
                    aria-label={`Remover ${flavor}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Nome do sabor"
                  maxLength={60}
                  value={newFlavorName}
                  onChange={(e) => {
                    setNewFlavorName(e.target.value);
                    if (newFlavorError) setNewFlavorError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddModalFlavor();
                    }
                  }}
                  error={newFlavorError}
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddModalFlavor}
                className="mt-0.5 h-11"
              >
                Adicionar
              </Button>
            </div>

            {errors.flavors && (
              <p className="text-xs font-medium text-accent-red">
                {errors.flavors}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function getInitialForm(item: MenuItemWithFlavors | null): FormData {
  if (item) {
    return {
      name: item.name,
      description: item.description,
      price: priceToCents(item.price),
      category: item.category,
      allowsFlavors: item.allows_flavors,
      maxFlavors: String(item.max_flavors),
      flavors: [],
    };
  }

  return {
    name: "",
    description: "",
    price: "",
    category: "",
    allowsFlavors: false,
    maxFlavors: "1",
    flavors: [],
  };
}
