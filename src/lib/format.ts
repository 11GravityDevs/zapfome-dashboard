import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return BRL_FORMATTER.format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

function toDate(date: string | Date): Date {
  return typeof date === "string" ? parseISO(date) : date;
}

export function formatDate(date: string | Date): string {
  return format(toDate(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return format(toDate(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatTime(time: string | Date): string {
  if (typeof time === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return time.slice(0, 5);
  }
  return format(toDate(time), "HH:mm", { locale: ptBR });
}

export function timeAgo(date: string | Date): string {
  const d = toDate(date);
  const diffSeconds = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));

  if (diffSeconds < 45) return "agora";

  const distance = formatDistanceToNowStrict(d, { locale: ptBR });
  return distance
    .replace(/minutos?/, "min")
    .replace(/horas?/, "h")
    .replace(/dias?/, "d")
    .replace(/segundos?/, "s")
    .replace(/semanas?/, "sem")
    .replace(/meses?|mês/, "mês")
    .replace(/anos?/, "ano");
}
