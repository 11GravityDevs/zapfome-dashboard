import { DAY_ORDER, type BusinessHourRow } from "@/lib/constants/settings";
import type { BusinessHours } from "@/lib/types/database";

function toHHmm(time: string | null): string {
  if (!time) return "12:00";
  return time.slice(0, 5);
}

export function toBusinessHourRows(rows: BusinessHours[]): BusinessHourRow[] {
  const mapped = rows.map((r) => ({
    dayOfWeek: r.day_of_week,
    openTime: toHHmm(r.open_time),
    closeTime: toHHmm(r.close_time),
    isClosed: r.is_closed,
  }));

  return DAY_ORDER.map(
    (day) =>
      mapped.find((r) => r.dayOfWeek === day) ?? {
        dayOfWeek: day,
        openTime: "12:00",
        closeTime: "12:00",
        isClosed: day === 0,
      },
  );
}
