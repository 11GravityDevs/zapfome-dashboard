"use client";

import { useState } from "react";
import { Check, MapPin, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Input } from "@/components/input";
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
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineValues, setInlineValues] = useState({ neighborhood: "", city: "", fee: "" });
  const [deletingZone, setDeletingZone] = useState<DeliveryZone | null>(null);

  async function handleAddZone(neighborhood: string, city: string, fee: number) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("delivery_zone")
      .insert({ tenant_id: tenantId, neighborhood, city, fee, is_active: true })
      .select()
      .single();

    if (error || !data) {
      showToast({ variant: "error", title: "Erro ao adicionar zona de entrega." });
      return;
    }

    onZonesChange([...zones, data]);
    showToast({ variant: "success", title: "Zona de entrega adicionada." });
  }

  async function handleToggleActive(zone: DeliveryZone) {
    const supabase = createClient();
    const newValue = !zone.is_active;
    const { error } = await supabase
      .from("delivery_zone")
      .update({ is_active: newValue })
      .eq("id", zone.id)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao atualizar zona." });
      return;
    }

    onZonesChange(zones.map((z) => (z.id === zone.id ? { ...z, is_active: newValue } : z)));
  }

  function startInlineEdit(zone: DeliveryZone) {
    setInlineEditId(zone.id);
    setInlineValues({
      neighborhood: zone.neighborhood,
      city: zone.city,
      fee: String(zone.fee),
    });
  }

  async function saveInlineEdit(zoneId: string) {
    const fee = parseFloat(inlineValues.fee.replace(",", "."));
    if (!inlineValues.neighborhood || !inlineValues.city || isNaN(fee) || fee < 0) {
      showToast({ variant: "warning", title: "Preencha todos os campos corretamente." });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("delivery_zone")
      .update({ neighborhood: inlineValues.neighborhood, city: inlineValues.city, fee })
      .eq("id", zoneId)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao atualizar zona." });
      return;
    }

    onZonesChange(
      zones.map((z) =>
        z.id === zoneId
          ? { ...z, neighborhood: inlineValues.neighborhood, city: inlineValues.city, fee }
          : z,
      ),
    );
    setInlineEditId(null);
    showToast({ variant: "success", title: "Zona atualizada." });
  }

  async function handleDelete() {
    if (!deletingZone) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("delivery_zone")
      .delete()
      .eq("id", deletingZone.id)
      .eq("tenant_id", tenantId);

    if (error) {
      showToast({ variant: "error", title: "Erro ao remover zona." });
      setDeletingZone(null);
      return;
    }

    onZonesChange(zones.filter((z) => z.id !== deletingZone.id));
    showToast({ variant: "success", title: "Zona removida." });
    setDeletingZone(null);
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
          <p className="text-sm text-font-secondary py-4">
            Nenhuma zona de entrega configurada.
          </p>
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
                  <TD>
                    {inlineEditId === zone.id ? (
                      <Input
                        value={inlineValues.neighborhood}
                        onChange={(e) =>
                          setInlineValues((v) => ({ ...v, neighborhood: e.target.value }))
                        }
                      />
                    ) : (
                      zone.neighborhood
                    )}
                  </TD>
                  <TD>
                    {inlineEditId === zone.id ? (
                      <Input
                        value={inlineValues.city}
                        onChange={(e) =>
                          setInlineValues((v) => ({ ...v, city: e.target.value }))
                        }
                      />
                    ) : (
                      <span className="text-font-secondary">{zone.city}</span>
                    )}
                  </TD>
                  <TD>
                    {inlineEditId === zone.id ? (
                      <Input
                        value={inlineValues.fee}
                        onChange={(e) =>
                          setInlineValues((v) => ({ ...v, fee: e.target.value }))
                        }
                        className="w-20"
                      />
                    ) : (
                      formatCurrency(zone.fee)
                    )}
                  </TD>
                  <TD>
                    <Toggle
                      checked={zone.is_active}
                      onCheckedChange={() => handleToggleActive(zone)}
                      label={`Ativar/desativar ${zone.neighborhood}`}
                    />
                  </TD>
                  <TD>
                    <div className="flex items-center gap-(--spacing-sm)">
                      {inlineEditId === zone.id ? (
                        <>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => saveInlineEdit(zone.id)}
                            aria-label="Salvar edição"
                            className="text-success-500"
                          >
                            <Check size={20} />
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => setInlineEditId(null)}
                            aria-label="Cancelar edição"
                          >
                            <X size={20} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => startInlineEdit(zone)}
                            aria-label={`Editar ${zone.neighborhood}`}
                          >
                            <Pencil size={20} />
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => setDeletingZone(zone)}
                            aria-label={`Remover ${zone.neighborhood}`}
                            className="text-font-secondary hover:text-accent-red"
                          >
                            <Trash2 size={20} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <ZoneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddZone}
      />

      {deletingZone && (
        <Modal
          open
          onClose={() => setDeletingZone(null)}
          title="Remover zona"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeletingZone(null)}>
                Cancelar
              </Button>
              <Button variant="red" onClick={handleDelete}>
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
