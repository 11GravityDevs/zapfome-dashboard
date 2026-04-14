export const DAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

export const DEFAULT_OPEN_TIME = "11:00";
export const DEFAULT_CLOSE_TIME = "23:00";

export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

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
