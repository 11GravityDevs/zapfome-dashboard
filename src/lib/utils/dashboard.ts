import { startOfMonth, subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import { PERIOD_OPTIONS, type Period } from "@/lib/constants/dashboard";

export type TopProduct = {
  name: string;
  total_sold: number;
};

export function getPeriodLabel(period: Period): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Hoje";
}

export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (period) {
    case "today":
      return { start: todayStart, end: endOfDay(now) };
    case "7days":
      return { start: subDays(todayStart, 6), end: endOfDay(now) };
    case "30days":
      return { start: subDays(todayStart, 29), end: endOfDay(now) };
    case "month":
      return { start: startOfMonth(now), end: endOfDay(now) };
  }
}

export function getPrevPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (period) {
    case "today":
      return { start: subDays(todayStart, 1), end: endOfDay(subDays(now, 1)) };
    case "7days":
      return { start: subDays(todayStart, 13), end: endOfDay(subDays(now, 7)) };
    case "30days":
      return { start: subDays(todayStart, 59), end: endOfDay(subDays(now, 30)) };
    case "month": {
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfDay(subDays(startOfMonth(now), 1));
      return { start: prevMonthStart, end: prevMonthEnd };
    }
  }
}

export function calcTrend(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function isTopProduct(row: unknown): row is TopProduct {
  return (
    typeof row === "object" &&
    row !== null &&
    "name" in row &&
    "total_sold" in row &&
    typeof (row as TopProduct).name === "string" &&
    typeof (row as TopProduct).total_sold === "number"
  );
}
