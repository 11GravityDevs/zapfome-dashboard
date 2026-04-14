"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/cn";
import { PAUSE_DURATION_OPTIONS } from "@/lib/constants/orders";

type PauseDuration = number | "indefinite" | "custom";

type PauseModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (minutes: number | "indefinite") => void;
  loading?: boolean;
};

export function PauseModal({ open, onClose, onConfirm, loading }: PauseModalProps) {
  const [selected, setSelected] = useState<PauseDuration>(15);
  const [customMinutes, setCustomMinutes] = useState("");

  function handleConfirm() {
    if (selected === "indefinite") {
      onConfirm("indefinite");
      return;
    }
    const minutes = selected === "custom" ? parseInt(customMinutes, 10) : selected;
    if (!minutes || minutes <= 0) return;
    onConfirm(minutes);
  }

  const isValid =
    selected === "indefinite" ||
    (selected === "custom" ? parseInt(customMinutes, 10) > 0 : true);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pausar recebimento de pedidos"
      size="md"
      locked={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="red"
            onClick={handleConfirm}
            disabled={!isValid || loading}
            loading={loading}
          >
            Pausar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-(--spacing-lg)">
        <p className="text-sm text-font-secondary">
          Determine por quanto tempo deseja pausar o recebimento de novos pedidos pelo WhatsApp.
        </p>

        <div className="grid grid-cols-5 gap-2">
          {PAUSE_DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                selected === option.value
                  ? "border-brand-primary bg-brand-primary-light text-brand-primary"
                  : "border-border bg-bg-card text-font-primary hover:bg-bg-hover",
              )}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected("custom")}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
              selected === "custom"
                ? "border-brand-primary bg-brand-primary-light text-brand-primary"
                : "border-border bg-bg-card text-font-primary hover:bg-bg-hover",
            )}
          >
            Outro
          </button>
        </div>

        {selected === "custom" && (
          <Input
            type="number"
            min={1}
            max={1440}
            step={1}
            placeholder="Minutos"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        )}

        <p className="text-xs font-medium text-accent-orange">
          Isso impedirá automaticamente que clientes façam novos pedidos pelo WhatsApp.
        </p>
      </div>
    </Modal>
  );
}
