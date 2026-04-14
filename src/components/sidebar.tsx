"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  ClipboardList,
  Home,
  Settings,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

const NAV_ITEMS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Pedidos", icon: ClipboardList, href: "/pedidos" },
  { label: "Cardápio", icon: UtensilsCrossed, href: "/cardapio" },
  { label: "Histórico", icon: Clock, href: "/historico" },
  { label: "Configurações", icon: Settings, href: "/configuracoes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-bg-sidebar text-font-sidebar">
      <div className="flex items-center gap-2 px-3 py-6">
        <Logo direction="horizontal" zapVariant="white" imageSize={44} fontSize={24} />
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-primary text-font-sidebar-active shadow-brand-glow"
                      : "text-font-sidebar hover:bg-border-dark hover:text-font-sidebar-active",
                  )}
                >
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
