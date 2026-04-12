import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  bordered?: boolean;
  elevation?: "none" | "soft" | "card";
  padding?: "none" | "md" | "lg" | "xl";
  children?: ReactNode;
};

const elevationClasses = {
  none: "",
  soft: "shadow-soft",
  card: "shadow-card",
} as const;

const paddingClasses = {
  none: "",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
} as const;

export function Card({
  bordered = true,
  elevation = "soft",
  padding = "lg",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-lg",
        bordered && "border border-border",
        elevationClasses[elevation],
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
