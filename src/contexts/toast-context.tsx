"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { toast, type ToastIcon, type ToastOptions } from "react-toastify";

export type ToastVariant = "error" | "success" | "warning" | "info";

export type ShowToastOptions = {
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
};

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

const variantIcons: Record<ToastVariant, ToastIcon> = {
  error: () => <CircleAlert size={20} />,
  success: () => <CircleCheck size={20} />,
  warning: () => <TriangleAlert size={20} />,
  info: () => <Info size={20} />,
};

const variantFn: Record<ToastVariant, typeof toast.error> = {
  error: toast.error,
  success: toast.success,
  warning: toast.warning,
  info: toast.info,
};

function ToastBody({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-(--spacing-2xs) text-xs opacity-90">{description}</p>}
    </div>
  );
}

export function showToast({ variant, title, description, duration }: ShowToastOptions) {
  const options: ToastOptions = {
    autoClose: duration ?? (variant === "error" ? ERROR_DURATION : DEFAULT_DURATION),
    icon: variantIcons[variant],
  };

  variantFn[variant](<ToastBody title={title} description={description} />, options);
}

export function useToast() {
  return { showToast };
}
