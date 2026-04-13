import type { Tenant } from "@/lib/types/database";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";

export function TopBar({ tenant }: { tenant: Tenant }) {
  const initials = tenant.name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || tenant.name.slice(0, 2).toUpperCase();

  const botActive = tenant.is_active && !tenant.paused_until;

  return (
    <header className="sticky shadow-soft top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-card px-8">
      <span className="text-base font-semibold text-font-primary truncate">{tenant.name}</span>

      <div className="flex items-center gap-4">
        <Badge variant={botActive ? "green" : "neutral"} className="gap-2 px-3 py-1">
          <span
            aria-hidden="true"
            className={cn(
              "inline-block size-2 rounded-full",
              botActive ? "bg-accent-green" : "bg-font-secondary",
            )}
          />
          {botActive ? "Bot ativo" : "Bot inativo"}
        </Badge>

        <span
          aria-label={`Usuário do ${tenant.name}`}
          className="inline-flex size-8 items-center justify-center rounded-full bg-brand-primary-light text-xs font-semibold text-brand-primary"
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
