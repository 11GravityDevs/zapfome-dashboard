"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

type NewFlavorModalProps = {
  open: boolean;
  onClose: () => void;
  existingFlavors: string[];
  onConfirm: (name: string, price: number | null) => void | Promise<void>;
};

export function NewFlavorModal({ open, onClose, existingFlavors, onConfirm }: NewFlavorModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setName("");
    setPrice("");
    setError("");
    setSaving(false);
  }

  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  async function handleConfirm() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Nome do sabor é obrigatório.");
      return;
    }

    if (existingFlavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setError("Esse sabor já existe.");
      return;
    }

    const priceValue = Number(price) > 0 ? Number(price) / 100 : null;

    setSaving(true);
    try {
      await onConfirm(trimmed, priceValue);
    } catch (err) {
      console.error("[NewFlavorModal] Unexpected error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo sabor"
      size="sm"
      locked={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={saving}>
            Adicionar
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
