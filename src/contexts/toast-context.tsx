"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ToastVariant = "error" | "success" | "warning" | "info";

export type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
};

export type ShowToastOptions = Omit<Toast, "id">;

type ToastContextValue = {
  toasts: Toast[];
  showToast: (options: ShowToastOptions) => void;
  hideToast: (id: string) => void;
};

const MAX_TOASTS = 3;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ShowToastOptions) => {
    const toast: Toast = { ...options, id: crypto.randomUUID() };
    setToasts((prev) => [toast, ...prev].slice(0, MAX_TOASTS));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>.");
  }
  return ctx;
}
