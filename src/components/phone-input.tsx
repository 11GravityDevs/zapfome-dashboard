import type { ChangeEvent } from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/input";

type PhoneInputProps = {
  label?: string;
  value: string;
  onChange: (digits: string) => void;
  error?: string;
  disabled?: boolean;
};

function formatPhoneMask(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function PhoneInput({ label, value, onChange, error, disabled }: PhoneInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    onChange(digits);
  }

  return (
    <Input
      label={label}
      type="tel"
      inputMode="tel"
      placeholder="(11) 91234-5678"
      maxLength={15}
      value={formatPhoneMask(value)}
      onChange={handleChange}
      leadingIcon={<Phone size={16} />}
      error={error}
      disabled={disabled}
    />
  );
}
