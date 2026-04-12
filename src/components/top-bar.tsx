import type { Tenant } from "@/lib/types/database";

export function TopBar({ tenant }: { tenant: Tenant }) {
  const initials = tenant.name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || tenant.name.slice(0, 2).toUpperCase();

  const botActive = tenant.is_active && !tenant.paused_until;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-card px-6">
      <span className="text-base font-semibold text-font-primary truncate">{tenant.name}</span>

      <div className="flex items-center gap-4">
        <span
          className={
            botActive
              ? "inline-flex items-center gap-2 rounded-full bg-accent-green-light px-3 py-1 text-xs font-semibold text-accent-green"
              : "inline-flex items-center gap-2 rounded-full bg-bg-secondary px-3 py-1 text-xs font-semibold text-font-secondary"
          }
        >
          <span
            aria-hidden="true"
            className={`inline-block size-2 rounded-full ${botActive ? "bg-accent-green" : "bg-font-secondary"}`}
          />
          {botActive ? "Bot ativo" : "Bot inativo"}
        </span>

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
