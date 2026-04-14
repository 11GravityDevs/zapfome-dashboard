"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import type { MenuItemFlavor } from "@/lib/types/database";

function priceToCents(price: number | null): string {
  if (price == null || price <= 0) return "";
  const cents = Math.round(price * 100);
  return String(cents);
}

type EditFlavorModalProps = {
  open: boolean;
  onClose: () => void;
  flavor: MenuItemFlavor | null;
  existingFlavors: string[];
  onConfirm: (flavorId: string, name: string, price: number | null) => void | Promise<void>;
};

export function EditFlavorModal({
  open,
  onClose,
  flavor,
  existingFlavors,
  onConfirm,
}: EditFlavorModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setName(flavor?.name ?? "");
    setPrice(priceToCents(flavor?.price ?? null));
    setError("");
    setSaving(false);
  }

  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  async function handleConfirm() {
    if (!flavor) return;

    const trimmed = name.trim();

    if (!trimmed) {
      setError("Nome do sabor é obrigatório.");
      return;
    }

    if (
      trimmed.toLowerCase() !== flavor.name.toLowerCase() &&
      existingFlavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError("Esse sabor já existe.");
      return;
    }

    const priceValue = Number(price) > 0 ? Number(price) / 100 : null;

    setSaving(true);
    try {
      await onConfirm(flavor.id, trimmed, priceValue);
    } catch (err) {
      console.error("[EditFlavorModal] Unexpected error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar sabor"
      size="sm"
      locked={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nome do sabor"
          maxLength={60}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          error={error}
          autoFocus
        />
        <CurrencyInput
          label="Preço diferenciado (opcional)"
          value={price}
          onChange={setPrice}
        />
      </div>
    </Modal>
  );
}
