export const formatAttendanceDuration = (minutes: number | null): string => {
  if (minutes === null) {
    return "—";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

export const formatAttendanceDateTime = (iso: string): string => {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const toDatetimeLocalValue = (iso: string | null): string => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromDatetimeLocalValue = (value: string): string => {
  return new Date(value).toISOString();
};

export type AttendanceTab = "my-attendance" | "team-live" | "hr-corrections";

export const ATTENDANCE_TAB_IDS = [
  "my-attendance",
  "team-live",
  "hr-corrections",
] as const satisfies readonly AttendanceTab[];

export type AttendanceLogView = "calendar" | "list";

export const ATTENDANCE_24H_KEY = "hr-saas-attendance-24h";

export const GPS_CONSENT_KEY = "hr-saas-gps-consent";

export const formatAttendanceTime = (
  iso: string,
  use24Hour: boolean,
): string => {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24Hour,
  });
};

export const getCurrentWeekDates = (): string[] => {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const dates: string[] = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + diffToMonday + i,
      ),
    );
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
};

export const todayDateString = (): string =>
  new Date().toISOString().slice(0, 10);

export type AttendanceLogsTab =
  | "attendance-log"
  | "calendar"
  | "attendance-requests"
  | "overtime-requests";

export type AttendanceDisplayMode = "calendar" | "list";

export const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export interface AttendanceCalendarDay {
  date: string;
  day: number;
  year: number;
  month: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
}

/** Monday-first calendar grid (Monday-first layout). */
export const buildMondayFirstCalendarDays = (
  year: number,
  month: number,
): AttendanceCalendarDay[] => {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const sundayFirst = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayFirstOffset = sundayFirst === 0 ? 6 : sundayFirst - 1;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = new Date(
    Date.UTC(prevYear, prevMonth, 0),
  ).getUTCDate();

  const cells: AttendanceCalendarDay[] = [];

  for (let i = 0; i < mondayFirstOffset; i += 1) {
    const day = daysInPrevMonth - mondayFirstOffset + i + 1;
    const date = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dow = (i + 6) % 7;
    cells.push({
      date,
      day,
      year: prevYear,
      month: prevMonth,
      inCurrentMonth: false,
      isWeekend: dow >= 5,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dow = (mondayFirstOffset + day - 1) % 7;
    cells.push({
      date,
      day,
      year,
      month,
      inCurrentMonth: true,
      isWeekend: dow >= 5,
    });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const trailing = (7 - (cells.length % 7)) % 7;

  for (let day = 1; day <= trailing; day += 1) {
    const date = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const index = cells.length;
    const dow = index % 7;
    cells.push({
      date,
      day,
      year: nextYear,
      month: nextMonth,
      inCurrentMonth: false,
      isWeekend: dow >= 5,
    });
  }

  return cells;
};

export const getMonthStrip = (
  year: number,
  month: number,
  count = 7,
): Array<{ year: number; month: number; label: string }> => {
  const items: Array<{ year: number; month: number; label: string }> = [];
  let y = year;
  let m = month;

  for (let i = 0; i < count; i += 1) {
    items.push({ year: y, month: m, label: MONTH_ABBR[m - 1] ?? "" });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }

  return items;
};

export const formatAttendanceDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatAttendanceMonthYear = (
  year: number,
  month: number,
): string => {
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
    undefined,
    { month: "long" },
  );
  return `${name}, ${year}`;
};

export const avgHoursPerDay = (totalMinutes: number, days: number): string => {
  if (days <= 0) {
    return "—";
  }
  return formatAttendanceDuration(Math.round(totalMinutes / days));
};
