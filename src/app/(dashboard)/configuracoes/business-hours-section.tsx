"use client";

import { Clock, Info } from "lucide-react";
import { Badge } from "@/components/badge";
import { Card } from "@/components/card";
import { Input } from "@/components/input";
import { Toggle } from "@/components/toggle";
import { DAY_NAMES, type BusinessHourRow } from "@/lib/constants/settings";

type Props = {
  hours: BusinessHourRow[];
  onChange: (hours: BusinessHourRow[]) => void;
};

function isNextDayClose(open: string, close: string): boolean {
  if (!open || !close) return false;
  return close <= open && close !== "";
}

export function BusinessHoursSection({ hours, onChange }: Props) {
  function updateRow(index: number, patch: Partial<BusinessHourRow>) {
    const next = hours.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-font-secondary">
                Dia
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-font-secondary">
                Abre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-font-secondary">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-font-secondary">
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
                  <Input
                    type="time"
                    value={row.openTime}
                    disabled={row.isClosed}
                    onChange={(e) => updateRow(i, { openTime: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-(--spacing-sm)">
                    <Input
                      type="time"
                      value={row.closeTime}
                      disabled={row.isClosed}
                      onChange={(e) => updateRow(i, { closeTime: e.target.value })}
                    />
                    {!row.isClosed && isNextDayClose(row.openTime, row.closeTime) && (
                      <Badge variant="orange">
                        <Info size={14} />
                        Meia-noite (madrugada do dia seguinte)
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={row.isClosed}
                    onCheckedChange={(val) => updateRow(i, { isClosed: val })}
                    label={`Marcar ${DAY_NAMES[row.dayOfWeek]} como fechado`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
