export const DAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

export const DEFAULT_OPEN_TIME = "12:00";
export const DEFAULT_CLOSE_TIME = "12:00";

export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  const value = `${hours}:${minutes}`;
  return { value, label: value };
});

export type BusinessHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export function buildDefaultBusinessHours(): BusinessHourRow[] {
  return DAY_ORDER.map((day) => ({
    dayOfWeek: day,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    isClosed: day === 0,
  }));
}
