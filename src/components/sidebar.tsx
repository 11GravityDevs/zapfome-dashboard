"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clock,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/cn";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

const NAV_ITEMS: { label: string; icon: ReactNode; href: string }[] = [
  { label: "Início", icon: <Home size={20} aria-hidden="true" />, href: "/" },
  {
    label: "Pedidos",
    icon: <ClipboardList size={20} aria-hidden="true" />,
    href: "/pedidos",
  },
  {
    label: "Cardápio",
    icon: <UtensilsCrossed size={20} aria-hidden="true" />,
    href: "/cardapio",
  },
  {
    label: "Histórico",
    icon: <Clock size={20} aria-hidden="true" />,
    href: "/historico",
  },
  {
    label: "Conexão",
    icon: <WhatsappIcon size={20} aria-hidden="true" />,
    href: "/conexao",
  },
  {
    label: "Pagamentos",
    icon: <CreditCard size={20} aria-hidden="true" />,
    href: "/pagamentos",
  },
  {
    label: "Configurações",
    icon: <Settings size={20} aria-hidden="true" />,
    href: "/configuracoes",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast({ variant: "error", title: "Erro ao sair. Tente novamente." });
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      showToast({ variant: "error", title: "Erro ao sair. Tente novamente." });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-bg-sidebar text-font-sidebar">
      <div className="flex items-center gap-2 px-3 py-6">
        <Logo direction="horizontal" zapVariant="white" imageSize={44} fontSize={24} />
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon, href }) => {
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
                  {icon}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-dark px-3 py-3">
        <Button
          variant="sidebar"
          fullWidth
          leadingIcon={<LogOut size={20} aria-hidden="true" />}
          onClick={() => setShowLogoutModal(true)}
        >
          Sair
        </Button>
      </div>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sair da conta"
        size="sm"
        locked={loggingOut}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={loggingOut}
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="red" loading={loggingOut} onClick={handleLogout}>
              Sair
            </Button>
          </>
        }
      >
        <p className="text-sm text-font-secondary">Deseja mesmo sair?</p>
      </Modal>
    </aside>
  );
}
