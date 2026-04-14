"use client";

import { SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/card";
import { Input } from "@/components/input";

export type GeneralSettingsData = {
  minOrderValue: string;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
  pickupTimeMin: string;
  pickupTimeMax: string;
  greetingMessage: string;
  closedMessage: string;
};

type Props = {
  data: GeneralSettingsData;
  onChange: (data: GeneralSettingsData) => void;
};

const textareaClasses =
  "w-full rounded-md border border-border bg-bg-card px-4 py-3 text-sm text-font-primary " +
  "placeholder:text-font-secondary resize-none " +
  "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:outline-none";

export function GeneralSettingsSection({ data, onChange }: Props) {
  function update(field: keyof GeneralSettingsData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <Card>
      <div className="flex items-center gap-(--spacing-sm) mb-(--spacing-md)">
        <SlidersHorizontal size={20} className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-font-primary">Configurações gerais</h2>
      </div>

      <div className="flex flex-col gap-(--spacing-md)">
        <Input
          label="Pedido mínimo"
          placeholder="R$ 25,00"
          value={data.minOrderValue}
          onChange={(e) => update("minOrderValue", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-(--spacing-md)">
          <div>
            <label className="mb-(--spacing-xs) block text-xs font-medium text-font-secondary">
              Tempo de entrega (min)
            </label>
            <div className="flex items-center gap-(--spacing-sm)">
              <Input
                type="number"
                min={0}
                placeholder="30"
                value={data.deliveryTimeMin}
                onChange={(e) => update("deliveryTimeMin", e.target.value)}
              />
              <span className="text-font-secondary">—</span>
              <Input
                type="number"
                min={0}
                placeholder="50"
                value={data.deliveryTimeMax}
                onChange={(e) => update("deliveryTimeMax", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-(--spacing-xs) block text-xs font-medium text-font-secondary">
              Tempo de retirada (min)
            </label>
            <div className="flex items-center gap-(--spacing-sm)">
              <Input
                type="number"
                min={0}
                placeholder="15"
                value={data.pickupTimeMin}
                onChange={(e) => update("pickupTimeMin", e.target.value)}
              />
              <span className="text-font-secondary">—</span>
              <Input
                type="number"
                min={0}
                placeholder="25"
                value={data.pickupTimeMax}
                onChange={(e) => update("pickupTimeMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-(--spacing-xs) block text-xs font-medium text-font-secondary">
            Mensagem de boas-vindas
          </label>
          <textarea
            rows={3}
            placeholder="Olá! Bem-vindo ao nosso restaurante. Como posso ajudar?"
            value={data.greetingMessage}
            onChange={(e) => update("greetingMessage", e.target.value)}
            className={textareaClasses}
          />
        </div>

        <div>
          <label className="mb-(--spacing-xs) block text-xs font-medium text-font-secondary">
            Mensagem de fechado
          </label>
          <textarea
            rows={3}
            placeholder="Estamos fechados no momento. Nosso horário de funcionamento é..."
            value={data.closedMessage}
            onChange={(e) => update("closedMessage", e.target.value)}
            className={textareaClasses}
          />
        </div>
      </div>
    </Card>
  );
}
