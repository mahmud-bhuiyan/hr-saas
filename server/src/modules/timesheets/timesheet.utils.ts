export const DEFAULT_OVERTIME_THRESHOLD_HOURS = 40;

export const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

export const parseDateOnly = (dateStr: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error('Invalid date format');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
};

export const getMondayOfWeek = (date: Date): Date => {
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = normalized.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setUTCDate(normalized.getUTCDate() + diff);
  return normalized;
};

export const parseWeekOf = (weekOfStr: string): Date => {
  const monday = parseDateOnly(weekOfStr);
  if (monday.getUTCDay() !== 1) {
    throw new Error('weekOf must be a Monday (YYYY-MM-DD)');
  }
  return monday;
};

export const getWeekEndExclusive = (weekOf: Date): Date => {
  const end = new Date(weekOf);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
};

export const getWeekDays = (weekOf: Date): Date[] =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekOf);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });

export const roundHours = (hours: number): number => Math.round(hours * 100) / 100;
