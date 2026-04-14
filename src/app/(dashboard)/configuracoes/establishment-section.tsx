"use client";

import { Building2 } from "lucide-react";
import { Card } from "@/components/card";
import { Input } from "@/components/input";
import { PhoneInput } from "@/components/phone-input";

export type EstablishmentData = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

type EstablishmentErrors = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
};

type Props = {
  data: EstablishmentData;
  onChange: (data: EstablishmentData) => void;
  errors?: EstablishmentErrors;
};

export function EstablishmentSection({ data, onChange, errors }: Props) {
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
          maxLength={100}
          value={data.name}
          error={errors?.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <PhoneInput
          label="Telefone"
          value={data.phone}
          error={errors?.phone}
          onChange={(digits) => update("phone", digits)}
        />
        <Input
          label="Endereço"
          placeholder="Rua, número"
          maxLength={200}
          value={data.address}
          error={errors?.address}
          onChange={(e) => update("address", e.target.value)}
        />
        <Input
          label="Cidade"
          placeholder="São Paulo"
          maxLength={100}
          value={data.city}
          error={errors?.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>
    </Card>
  );
}
