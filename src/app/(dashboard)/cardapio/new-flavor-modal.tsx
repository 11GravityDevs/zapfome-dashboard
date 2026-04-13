"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

type NewFlavorModalProps = {
  open: boolean;
  onClose: () => void;
  existingFlavors: string[];
  onConfirm: (name: string) => void;
};

export function NewFlavorModal({
  open,
  onClose,
  existingFlavors,
  onConfirm,
}: NewFlavorModalProps) {
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
      setError("Nome do sabor é obrigatório.");
      return;
    }

    if (existingFlavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setError("Esse sabor já existe.");
      return;
    }

    onConfirm(trimmed);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo sabor"
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
        label="Nome do sabor"
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
