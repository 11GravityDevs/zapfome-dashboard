"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  dismissOnOverlayClick?: boolean;
  locked?: boolean;
  children?: ReactNode;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  headerActions,
  footer,
  size = "md",
  dismissOnOverlayClick = true,
  locked = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, locked]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-(--bg-modal-overlay)"
        onClick={dismissOnOverlayClick && !locked ? onClose : undefined}
      />

      <div
        className={cn(
          "relative z-10 w-full rounded-xl bg-bg-card shadow-card",
          "flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden",
          sizeClasses[size],
        )}
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-8 py-6">
          <h2 className="text-lg font-semibold text-font-primary">{title}</h2>
          <div className="flex items-center gap-3">
            {headerActions}
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              disabled={locked}
              autoFocus
              className="-m-2 cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover disabled:pointer-events-none disabled:opacity-40"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-border px-8 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
