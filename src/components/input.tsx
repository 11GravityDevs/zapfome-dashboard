import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, trailingIcon, className, id, disabled, type, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-font-secondary">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center gap-2 rounded-md border bg-bg-card px-4 h-11 transition-colors",
          "focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/30",
          hasError ? "border-accent-red" : "border-border",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {leadingIcon && <span className="text-font-secondary shrink-0">{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "flex-1 bg-transparent text-sm text-font-primary placeholder:text-font-secondary",
            "outline-none disabled:cursor-not-allowed",
            className,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 text-font-secondary hover:text-font-primary transition-colors cursor-pointer"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {trailingIcon && <span className="text-font-secondary shrink-0">{trailingIcon}</span>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-accent-red">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-font-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
