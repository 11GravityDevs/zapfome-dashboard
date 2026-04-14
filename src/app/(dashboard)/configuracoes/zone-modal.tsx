"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (neighborhood: string, city: string, fee: number) => Promise<void>;
};

export function ZoneModal({ open, onClose, onSave }: Props) {
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [fee, setFee] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setNeighborhood("");
    setCity("");
    setFee("");
  }

  async function handleSubmit() {
    const parsedFee = parseFloat(fee.replace(",", "."));
    if (!neighborhood.trim() || !city.trim() || isNaN(parsedFee) || parsedFee < 0) return;

    setSaving(true);
    await onSave(neighborhood.trim(), city.trim(), parsedFee);
    setSaving(false);
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar zona de entrega"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            disabled={!neighborhood.trim() || !city.trim() || !fee.trim()}
          >
            Adicionar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-(--spacing-md)">
        <Input
          label="Bairro"
          placeholder="Ex: Centro"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
        <Input
          label="Cidade"
          placeholder="Ex: São Paulo"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          label="Taxa (R$)"
          placeholder="Ex: 5,00"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
      </div>
    </Modal>
  );
}
