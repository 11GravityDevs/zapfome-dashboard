import type { ChangeEvent } from "react";
import { Input } from "@/components/input";

type CurrencyInputProps = {
  label?: string;
  value: string;
  onChange: (cents: string) => void;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
};

function formatCentsDisplay(cents: string): string {
  const num = Number(cents) || 0;
  const reais = Math.floor(num / 100);
  const centavos = num % 100;
  const reaisFormatted = reais.toLocaleString("pt-BR");
  return `${reaisFormatted},${String(centavos).padStart(2, "0")}`;
}

export function CurrencyInput({ label, value, onChange, error, maxLength = 12, disabled }: CurrencyInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    onChange(digits);
  }

  return (
    <Input
      label={label}
      type="text"
      inputMode="numeric"
      maxLength={maxLength}
      value={formatCentsDisplay(value)}
      onChange={handleChange}
      leadingIcon={<span className="text-sm font-medium">R$</span>}
      error={error}
      disabled={disabled}
    />
  );
}
