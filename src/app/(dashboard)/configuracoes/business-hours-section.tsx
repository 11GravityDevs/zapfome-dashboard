"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/card";
import { Select } from "@/components/select";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/contexts/toast-context";
import { DAY_NAMES, TIME_OPTIONS, type BusinessHourRow } from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/client";

type Props = {
  hours: BusinessHourRow[];
  onChange: (hours: BusinessHourRow[]) => void;
  tenantId?: string;
  onToggleSaved?: (hours: BusinessHourRow[]) => void;
};

export function BusinessHoursSection({ hours, onChange, tenantId, onToggleSaved }: Props) {
  const { showToast } = useToast();

  function updateRow(index: number, patch: Partial<BusinessHourRow>) {
    const next = hours.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  }

  async function handleToggleClosed(index: number, isClosed: boolean) {
    const row = hours[index];
    const next = hours.map((r, i) => (i === index ? { ...r, isClosed } : r));
    onChange(next);

    if (!tenantId || !onToggleSaved) return;

    try {
      const supabase = createClient();
      const updatedRow = next[index];
      const { error } = await supabase.from("business_hours").upsert(
        {
          tenant_id: tenantId,
          day_of_week: row.dayOfWeek,
          open_time: isClosed ? null : updatedRow.openTime,
          close_time: isClosed ? null : updatedRow.closeTime,
          is_closed: isClosed,
        },
        { onConflict: "tenant_id,day_of_week" },
      );

      if (error) {
        console.error("[BusinessHours] Toggle closed error:", error);
        onChange(hours);
        showToast({ variant: "error", title: "Erro ao atualizar horário." });
        return;
      }

      showToast({
        variant: isClosed ? "warning" : "success",
        title: isClosed
          ? `${DAY_NAMES[row.dayOfWeek]} marcado como fechado.`
          : `${DAY_NAMES[row.dayOfWeek]} marcado como aberto.`,
      });
      onToggleSaved(next);
    } catch (err) {
      console.error("[BusinessHours] Unexpected toggle error:", err);
      onChange(hours);
      showToast({ variant: "error", title: "Erro ao atualizar horário." });
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-(--spacing-sm) mb-(--spacing-md)">
        <Clock size={20} className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-font-primary">Horário de funcionamento</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-font-secondary w-1/4">
                Dia
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-font-secondary w-1/4">
                Abre
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-font-secondary w-1/4">
                Fecha
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-font-secondary w-1/4">
                Fechado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {hours.map((row, i) => (
              <tr key={row.dayOfWeek}>
                <td className="px-4 py-3 font-semibold text-font-primary">
                  {DAY_NAMES[row.dayOfWeek]}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Select
                      className="w-40"
                      options={TIME_OPTIONS}
                      value={row.openTime}
                      disabled={row.isClosed}
                      onChange={(value) => updateRow(i, { openTime: value })}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Select
                      className="w-40"
                      options={TIME_OPTIONS}
                      value={row.closeTime}
                      disabled={row.isClosed}
                      onChange={(value) => updateRow(i, { closeTime: value })}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={row.isClosed}
                      onCheckedChange={(val) => handleToggleClosed(i, val)}
                      label={`Marcar ${DAY_NAMES[row.dayOfWeek]} como fechado`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
