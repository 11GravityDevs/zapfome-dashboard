import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

export type KpiCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  trend?: { value: number; label?: string };
  highlight?: boolean;
  className?: string;
};

export function KpiCard({ icon, label, value, trend, highlight, className }: KpiCardProps) {
  const trendPositive = trend && trend.value >= 0;
  return (
    <Card
      className={cn(
        "flex flex-col gap-3",
        highlight && "border-accent-orange bg-accent-orange-light",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md text-brand-primary",
            highlight ? "bg-bg-card" : "bg-brand-primary-light",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              trendPositive
                ? "bg-accent-green-light text-accent-green"
                : "bg-accent-red-light text-accent-red",
            )}
          >
            {trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-font-secondary">{label}</span>
        <span className="text-xl font-bold leading-tight text-font-primary">{value}</span>
        {trend?.label && <span className="text-xs text-font-secondary">{trend.label}</span>}
      </div>
    </Card>
  );
}
