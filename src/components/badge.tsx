import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "blue" | "orange" | "green" | "red" | "neutral";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  blue: "bg-accent-blue-light text-accent-blue",
  orange: "bg-accent-orange-light text-accent-orange",
  green: "bg-accent-green-light text-accent-green",
  red: "bg-accent-red-light text-accent-red",
  neutral: "bg-bg-secondary text-font-secondary",
};

export function Badge({ variant = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold leading-none whitespace-nowrap",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
