"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast, type Toast, type ToastVariant } from "@/contexts/toast-context";

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 7000;

const variantConfig: Record<
  ToastVariant,
  { bg: string; Icon: typeof CircleAlert }
> = {
  error: { bg: "bg-error-500", Icon: CircleAlert },
  success: { bg: "bg-success-500", Icon: CircleCheck },
  warning: { bg: "bg-warning-500", Icon: TriangleAlert },
  info: { bg: "bg-info-500", Icon: Info },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [dismissing, setDismissing] = useState(false);
  const remainingRef = useRef(
    toast.duration ?? (toast.variant === "error" ? ERROR_DURATION : DEFAULT_DURATION),
  );
  const startRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const dismiss = () => {
    setDismissing(true);
    setTimeout(onClose, 150);
  };

  const startTimer = () => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(dismiss, remainingRef.current);
  };

  const pauseTimer = () => {
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
  };

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = variantConfig[toast.variant];
  const isAssertive = toast.variant === "error" || toast.variant === "warning";

  return (
    <div
      role="alert"
      aria-live={isAssertive ? "assertive" : "polite"}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={cn(
        "flex items-center gap-(--spacing-sm) rounded-lg p-(--spacing-md) shadow-soft",
        "min-w-80 max-w-[420px] text-font-white",
        config.bg,
        dismissing ? "animate-toast-fade-out" : "animate-toast-slide-in",
      )}
    >
      <config.Icon size={20} className="shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-(--spacing-2xs) text-xs opacity-90">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 size-8 flex items-center justify-center text-font-white/70 hover:text-font-white transition-colors cursor-pointer"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-(--spacing-lg) right-(--spacing-lg) z-60 flex flex-col gap-(--spacing-sm)">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
}
