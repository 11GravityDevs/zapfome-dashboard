"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import type { DeliveryZone } from "@/lib/types/database";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (neighborhood: string, city: string, fee: number) => Promise<void>;
  zone?: DeliveryZone | null;
};

export function ZoneModal({ open, onClose, onSave, zone }: Props) {
  const isEditing = Boolean(zone);

  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [feeCents, setFeeCents] = useState("");
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setNeighborhood(zone?.neighborhood ?? "");
    setCity(zone?.city ?? "");
    setFeeCents(zone ? String(Math.round(zone.fee * 100)) : "");
    setSaving(false);
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  async function handleSubmit() {
    const parsedFee = (Number(feeCents) || 0) / 100;
    if (!neighborhood.trim() || !city.trim() || parsedFee <= 0) return;

    setSaving(true);
    try {
      await onSave(neighborhood.trim(), city.trim(), parsedFee);
      onClose();
    } catch (err) {
      console.error("[ZoneModal] Unexpected save error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar zona de entrega" : "Adicionar zona de entrega"}
      size="sm"
      locked={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            disabled={!neighborhood.trim() || !city.trim() || !feeCents}
          >
            {isEditing ? "Salvar" : "Adicionar"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-(--spacing-md)">
        <Input
          label="Bairro"
          placeholder="Ex: Centro"
          maxLength={100}
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
        <Input
          label="Cidade"
          placeholder="Ex: São Paulo"
          maxLength={100}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <CurrencyInput label="Taxa de entrega" value={feeCents} onChange={setFeeCents} />
      </div>
    </Modal>
  );
}
