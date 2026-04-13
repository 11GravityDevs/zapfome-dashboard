"use client";

import { useState } from "react";
import { Button } from "@/components/button";
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
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function formatCurrency(cents: string): string {
  const num = Number(cents) || 0;
  const reais = Math.floor(num / 100);
  const centavos = num % 100;
  const reaisFormatted = reais.toLocaleString("pt-BR");
  return `${reaisFormatted},${String(centavos).padStart(2, "0")}`;
}

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

  if (open && !prevOpen) {
    setPrevOpen(true);
    setForm(getInitialForm(item));
    setErrors({});
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

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório.";
    if (!form.price || Number(form.price) <= 0) errs.price = "Preço deve ser maior que zero.";
    if (!form.category.trim()) errs.category = "Categoria é obrigatória.";
    if (form.allowsFlavors && (!form.maxFlavors || Number(form.maxFlavors) < 1)) {
      errs.maxFlavors = "Mínimo de 1 sabor.";
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
        showToast({ variant: "error", title: "Não foi possível atualizar o item." });
        setSaving(false);
        return;
      }

      showToast({ variant: "success", title: "Item atualizado." });
    } else {
      const { error } = await supabase
        .from("menu_item")
        .insert({
          ...payload,
          tenant_id: tenantId,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        showToast({ variant: "error", title: "Não foi possível criar o item." });
        setSaving(false);
        return;
      }

      showToast({ variant: "success", title: "Item criado." });
    }

    setSaving(false);
    onSaved();
  }

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    updateField("price", digits);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar item" : "Novo item"}
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
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-font-secondary">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            placeholder="Descrição do item"
            className="resize-none rounded-md border border-border bg-bg-card px-4 py-3 text-sm text-font-primary outline-none transition-colors placeholder:text-font-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço"
            type="text"
            inputMode="numeric"
            value={formatCurrency(form.price)}
            onChange={handlePriceChange}
            leadingIcon={<span className="text-sm font-medium">R$</span>}
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
            label="Permite sabores?"
          />
          <span className="text-sm text-font-primary">Permite sabores?</span>
        </div>

        {form.allowsFlavors && (
          <Input
            label="Qtd. máxima de sabores"
            type="number"
            min="1"
            value={form.maxFlavors}
            onChange={(e) => updateField("maxFlavors", e.target.value)}
            error={errors.maxFlavors}
          />
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
    };
  }

  return {
    name: "",
    description: "",
    price: "",
    category: "",
    allowsFlavors: false,
    maxFlavors: "1",
  };
}
