"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";

type ActivateModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  pausedUntil: string | null;
  isActive: boolean;
};

function formatTimeLeft(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

function computeTimeLeft(pausedUntil: string): string | null {
  const ms = new Date(pausedUntil).getTime() - Date.now();
  return ms > 0 ? formatTimeLeft(ms) : null;
}

export function ActivateModal({
  open,
  onClose,
  onConfirm,
  loading,
  pausedUntil,
  isActive,
}: ActivateModalProps) {
  const isIndefinite = !isActive && !pausedUntil;
  const shouldCount = open && !!pausedUntil;
  const currentTimeLeft = shouldCount ? computeTimeLeft(pausedUntil) : null;
  const [timeLeft, setTimeLeft] = useState(currentTimeLeft);

  if (timeLeft !== currentTimeLeft && !shouldCount) {
    setTimeLeft(currentTimeLeft);
  }
  if (shouldCount && timeLeft === null) {
    setTimeLeft(currentTimeLeft);
  }

  useEffect(() => {
    if (!shouldCount) return;

    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(pausedUntil!));
    }, 1000);
    return () => clearInterval(interval);
  }, [shouldCount, pausedUntil]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ativar bot"
      size="sm"
      locked={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="green" onClick={onConfirm} loading={loading}>
            Ativar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-(--spacing-md)">
        <p className="text-sm text-font-secondary">
          Tem certeza que deseja reativar o recebimento de pedidos pelo WhatsApp?
        </p>

        {isIndefinite ? (
          <p className="text-sm font-medium text-font-primary">
            O bot está pausado por tempo indeterminado.
          </p>
        ) : timeLeft ? (
          <p className="text-sm font-medium text-font-primary">
            Tempo restante da pausa: <span className="text-brand-primary">{timeLeft}</span>
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
