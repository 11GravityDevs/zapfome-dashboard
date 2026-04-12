"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/contexts/toast-context";
import { Toaster } from "@/components/toast";

export function ToastClientWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}
