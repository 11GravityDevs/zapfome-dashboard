import { DAY_ORDER, type BusinessHourRow } from "@/lib/constants/settings";
import type { BusinessHours } from "@/lib/types/database";

export function toBusinessHourRows(rows: BusinessHours[]): BusinessHourRow[] {
  const mapped = rows.map((r) => ({
    dayOfWeek: r.day_of_week,
    openTime: r.open_time ?? "11:00",
    closeTime: r.close_time ?? "23:00",
    isClosed: r.is_closed,
  }));

  return DAY_ORDER.map(
    (day) =>
      mapped.find((r) => r.dayOfWeek === day) ?? {
        dayOfWeek: day,
        openTime: "11:00",
        closeTime: "23:00",
        isClosed: day === 0,
      },
  );
}
