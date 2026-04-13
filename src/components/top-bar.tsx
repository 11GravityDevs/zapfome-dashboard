import type { Tenant } from "@/lib/types/database";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";

export function TopBar({ tenant }: { tenant: Tenant }) {
  const botActive = tenant.is_active && !tenant.paused_until;

  return (
    <header className="sticky shadow-soft top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-card px-8">
      <span className="text-lg font-bold text-font-primary truncate">{tenant.name}</span>

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
      </div>
    </header>
  );
}
