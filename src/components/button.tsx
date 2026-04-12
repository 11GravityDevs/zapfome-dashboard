import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "success" | "text";
export type ButtonSize = "default" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
};

const baseClasses =
  "inline-flex items-center cursor-pointer justify-center gap-2 font-semibold transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary " +
  "disabled:cursor-not-allowed disabled:bg-dark-200 disabled:text-dark-400 disabled:border-transparent";

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 text-base rounded-md",
  sm: "h-8 px-3 text-sm rounded-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-font-white hover:bg-brand-primary-dark",
  secondary: "bg-transparent text-font-primary border border-border hover:bg-bg-hover",
  destructive: "bg-transparent text-accent-red border border-accent-red hover:bg-accent-red-light",
  success: "bg-success-500 text-font-white hover:bg-success-600",
  text: "bg-transparent text-brand-primary hover:underline underline-offset-2 px-0 h-auto font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "default",
    fullWidth,
    leadingIcon,
    trailingIcon,
    loading,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isTextVariant = variant === "text";
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        baseClasses,
        !isTextVariant && sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
