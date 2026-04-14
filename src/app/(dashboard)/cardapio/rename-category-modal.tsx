"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

type RenameCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  currentName: string;
  existingCategories: string[];
  onConfirm: (newName: string) => void;
  loading?: boolean;
};

export function RenameCategoryModal({
  open,
  onClose,
  currentName,
  existingCategories,
  onConfirm,
  loading = false,
}: RenameCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setName(currentName);
    setError("");
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  function handleConfirm() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Nome da categoria é obrigatório.");
      return;
    }

    if (trimmed === currentName) {
      onClose();
      return;
    }

    const isDuplicate = existingCategories
      .filter((c) => c !== currentName)
      .some((c) => c.toLowerCase() === trimmed.toLowerCase());

    if (isDuplicate) {
      setError("Essa categoria já existe.");
      return;
    }

    onConfirm(trimmed);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Renomear categoria"
      size="sm"
      locked={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={loading}>
            Salvar
          </Button>
        </>
      }
    >
      <Input
        label="Nome da categoria"
        maxLength={50}
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
    </Modal>
  );
}
