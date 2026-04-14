"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

type NewCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  existingCategories: string[];
  onConfirm: (name: string) => void;
};

export function NewCategoryModal({
  open,
  onClose,
  existingCategories,
  onConfirm,
}: NewCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setName("");
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

    if (existingCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError("Essa categoria já existe.");
      return;
    }

    onConfirm(trimmed);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova categoria"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Adicionar</Button>
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
