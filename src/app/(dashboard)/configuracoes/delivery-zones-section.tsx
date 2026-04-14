"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Modal } from "@/components/modal";
import { Table, THead, TBody, TR, TH, TD } from "@/components/table";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryZone } from "@/lib/types/database";
import { ZoneModal } from "./zone-modal";

type Props = {
  tenantId: string;
  zones: DeliveryZone[];
  onZonesChange: (zones: DeliveryZone[]) => void;
};

export function DeliveryZonesSection({ tenantId, zones, onZonesChange }: Props) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<DeliveryZone | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  async function handleAddZone(neighborhood: string, city: string, fee: number) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("delivery_zone")
        .insert({ tenant_id: tenantId, neighborhood, city, fee, is_active: true })
        .select()
        .single();

      if (error || !data) {
        console.error("[DeliveryZones] Add zone error:", error);
        showToast({ variant: "error", title: "Erro ao adicionar zona de entrega." });
        return;
      }

      onZonesChange([...zones, data]);
      showToast({ variant: "success", title: "Zona de entrega adicionada." });
    } catch (err) {
      console.error("[DeliveryZones] Unexpected add zone error:", err);
      showToast({ variant: "error", title: "Erro ao adicionar zona de entrega." });
    }
  }

  async function handleEditZone(neighborhood: string, city: string, fee: number) {
    if (!editingZone) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("delivery_zone")
        .update({ neighborhood, city, fee })
        .eq("id", editingZone.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[DeliveryZones] Edit zone error:", error);
        showToast({ variant: "error", title: "Erro ao atualizar zona." });
        return;
      }

      onZonesChange(
        zones.map((z) => (z.id === editingZone.id ? { ...z, neighborhood, city, fee } : z)),
      );
      setEditingZone(null);
      showToast({ variant: "success", title: "Zona atualizada." });
    } catch (err) {
      console.error("[DeliveryZones] Unexpected edit zone error:", err);
      showToast({ variant: "error", title: "Erro ao atualizar zona." });
    }
  }

  async function handleToggleActive(zone: DeliveryZone) {
    const newValue = !zone.is_active;
    onZonesChange(zones.map((z) => (z.id === zone.id ? { ...z, is_active: newValue } : z)));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("delivery_zone")
        .update({ is_active: newValue })
        .eq("id", zone.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[DeliveryZones] Toggle active error:", error);
        onZonesChange(zones.map((z) => (z.id === zone.id ? { ...z, is_active: !newValue } : z)));
        showToast({ variant: "error", title: "Erro ao atualizar zona." });
        return;
      }

      showToast({
        variant: newValue ? "success" : "warning",
        title: newValue
          ? `Zona "${zone.neighborhood}" ativada.`
          : `Zona "${zone.neighborhood}" desativada.`,
      });
    } catch (err) {
      console.error("[DeliveryZones] Unexpected toggle error:", err);
      onZonesChange(zones.map((z) => (z.id === zone.id ? { ...z, is_active: !newValue } : z)));
      showToast({ variant: "error", title: "Erro ao atualizar zona." });
    }
  }

  async function handleDelete() {
    if (!deletingZone) return;
    setDeletingLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("delivery_zone")
        .delete()
        .eq("id", deletingZone.id)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[DeliveryZones] Delete zone error:", error);
        showToast({ variant: "error", title: "Erro ao remover zona." });
        return;
      }

      onZonesChange(zones.filter((z) => z.id !== deletingZone.id));
      showToast({ variant: "success", title: "Zona removida." });
    } catch (err) {
      console.error("[DeliveryZones] Unexpected delete error:", err);
      showToast({ variant: "error", title: "Erro ao remover zona." });
    } finally {
      setDeletingLoading(false);
      setDeletingZone(null);
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-(--spacing-md)">
          <div className="flex items-center gap-(--spacing-sm)">
            <MapPin size={20} className="text-brand-primary" />
            <h2 className="text-lg font-semibold text-font-primary">Zonas de entrega</h2>
          </div>
          <Button
            leadingIcon={<span className="text-lg leading-none">+</span>}
            onClick={() => setModalOpen(true)}
          >
            Adicionar zona
          </Button>
        </div>

        {zones.length === 0 ? (
          <p className="text-sm text-font-secondary py-4">Nenhuma zona de entrega configurada.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Bairro</TH>
                <TH>Cidade</TH>
                <TH>Taxa (R$)</TH>
                <TH>Ativo</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {zones.map((zone) => (
                <TR key={zone.id}>
                  <TD>{zone.neighborhood}</TD>
                  <TD>
                    <span className="text-font-secondary">{zone.city}</span>
                  </TD>
                  <TD>{formatCurrency(zone.fee)}</TD>
                  <TD>
                    <Toggle
                      checked={zone.is_active}
                      onCheckedChange={() => handleToggleActive(zone)}
                      label={`Ativar/desativar ${zone.neighborhood}`}
                    />
                  </TD>
                  <TD>
                    <div className="flex items-center gap-(--spacing-sm)">
                      <button
                        type="button"
                        onClick={() => setEditingZone(zone)}
                        className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-brand-primary"
                        aria-label={`Editar ${zone.neighborhood}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingZone(zone)}
                        className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-accent-red"
                        aria-label={`Remover ${zone.neighborhood}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <ZoneModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddZone} />

      <ZoneModal
        open={editingZone !== null}
        onClose={() => setEditingZone(null)}
        onSave={handleEditZone}
        zone={editingZone}
      />

      {deletingZone && (
        <Modal
          open
          onClose={() => setDeletingZone(null)}
          title="Remover zona"
          size="sm"
          locked={deletingLoading}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeletingZone(null)}
                disabled={deletingLoading}
              >
                Cancelar
              </Button>
              <Button variant="red" onClick={handleDelete} loading={deletingLoading}>
                Remover
              </Button>
            </>
          }
        >
          <p className="text-sm text-font-secondary">
            Tem certeza que deseja remover a zona <strong>{deletingZone.neighborhood}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}
