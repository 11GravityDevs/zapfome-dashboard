"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";

type DeleteConfirmModalProps = {
  open: boolean;
  itemName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
};

export function DeleteConfirmModal({
  open,
  itemName,
  loading,
  onConfirm,
  onClose,
  title = "Excluir item",
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="red" onClick={onConfirm} loading={loading}>
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-sm text-font-primary">
        Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação não pode ser
        desfeita.
      </p>
    </Modal>
  );
}
