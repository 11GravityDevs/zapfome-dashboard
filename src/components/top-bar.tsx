"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/cn";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";
import { PauseModal } from "@/app/(dashboard)/pedidos/pause-modal";
import { ActivateModal } from "@/app/(dashboard)/pedidos/activate-modal";

export function TopBar() {
  const { tenant, tenantId } = useTenant();
  const { showToast } = useToast();

  const [pausedUntil, setPausedUntil] = useState(tenant.paused_until);
  const [isActive, setIsActive] = useState(tenant.is_active);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const paused = !!pausedUntil || !isActive;

  const botActive = isActive && !pausedUntil;

  async function handlePause(minutes: number | "indefinite") {
    setLoading(true);

    try {
      const supabase = createClient();

      if (minutes === "indefinite") {
        const { error } = await supabase
          .from("tenant")
          .update({ paused_until: null, is_active: false })
          .eq("id", tenantId);

        if (error) {
          console.error("[TopBar] Pause (indefinite) error:", error);
          showToast({ variant: "error", title: "Erro ao pausar o bot." });
          return;
        }

        showToast({ variant: "success", title: "Bot pausado até você reativar." });
        setPausedUntil(null);
        setIsActive(false);
      } else {
        const newPausedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();

        const { error } = await supabase
          .from("tenant")
          .update({ paused_until: newPausedUntil })
          .eq("id", tenantId);

        if (error) {
          console.error("[TopBar] Pause (timed) error:", error);
          showToast({ variant: "error", title: "Erro ao pausar o bot." });
          return;
        }

        showToast({ variant: "success", title: `Bot pausado por ${minutes} minutos.` });
        setPausedUntil(newPausedUntil);
      }

      setPauseModalOpen(false);
    } catch (err) {
      console.error("[TopBar] Unexpected pause error:", err);
      showToast({ variant: "error", title: "Erro ao pausar o bot." });
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate() {
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tenant")
        .update({ paused_until: null, is_active: true })
        .eq("id", tenantId);

      if (error) {
        console.error("[TopBar] Activate error:", error);
        showToast({ variant: "error", title: "Erro ao ativar o bot." });
        return;
      }

      showToast({ variant: "success", title: "Bot ativado com sucesso." });
      setPausedUntil(null);
      setIsActive(true);
      setActivateModalOpen(false);
    } catch (err) {
      console.error("[TopBar] Unexpected activate error:", err);
      showToast({ variant: "error", title: "Erro ao ativar o bot." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="sticky shadow-soft top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-card px-8">
        <span className="text-lg font-bold text-font-primary truncate">{tenant.name}</span>

        <div className="flex items-center gap-4">
          {paused ? (
            <Button
              variant="green"
              size="sm"
              leadingIcon={<Play size={16} />}
              onClick={() => setActivateModalOpen(true)}
              loading={loading}
            >
              Ativar bot
            </Button>
          ) : (
            <Button
              variant="red"
              size="sm"
              leadingIcon={<Pause size={16} />}
              onClick={() => setPauseModalOpen(true)}
              loading={loading}
            >
              Pausar bot
            </Button>
          )}

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

      <PauseModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onConfirm={handlePause}
        loading={loading}
      />

      <ActivateModal
        open={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        onConfirm={handleActivate}
        loading={loading}
        pausedUntil={pausedUntil}
        isActive={isActive}
      />
    </>
  );
}
