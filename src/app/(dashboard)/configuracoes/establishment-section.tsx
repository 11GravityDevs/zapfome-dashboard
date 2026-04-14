"use client";

import { Building2 } from "lucide-react";
import { Card } from "@/components/card";
import { Input } from "@/components/input";

export type EstablishmentData = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

type Props = {
  data: EstablishmentData;
  onChange: (data: EstablishmentData) => void;
};

export function EstablishmentSection({ data, onChange }: Props) {
  function update(field: keyof EstablishmentData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <Card>
      <div className="flex items-center gap-(--spacing-sm) mb-(--spacing-md)">
        <Building2 size={20} className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-font-primary">Dados do estabelecimento</h2>
      </div>

      <div className="grid grid-cols-2 gap-(--spacing-md)">
        <Input
          label="Nome"
          placeholder="Nome do estabelecimento"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <Input
          label="Telefone"
          placeholder="(11) 91234-5678"
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Input
          label="Endereço"
          placeholder="Rua, número"
          value={data.address}
          onChange={(e) => update("address", e.target.value)}
        />
        <Input
          label="Cidade"
          placeholder="São Paulo"
          value={data.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>
    </Card>
  );
}
