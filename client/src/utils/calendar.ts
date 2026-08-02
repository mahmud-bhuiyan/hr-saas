export interface CalendarDay {
  date: string;
  day: number;
  year: number;
  month: number;
  inCurrentMonth: boolean;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const getDaysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const getFirstWeekday = (year: number, month: number): number =>
  new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

export const formatCalendarDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const buildCalendarDays = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const cells: CalendarDay[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    const day = daysInPrevMonth - firstWeekday + i + 1;
    cells.push({
      date: formatCalendarDate(prevYear, prevMonth, day),
      day,
      year: prevYear,
      month: prevMonth,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: formatCalendarDate(year, month, day),
      day,
      year,
      month,
      inCurrentMonth: true,
    });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const trailingCount = (7 - (cells.length % 7)) % 7;

  for (let day = 1; day <= trailingCount; day++) {
    cells.push({
      date: formatCalendarDate(nextYear, nextMonth, day),
      day,
      year: nextYear,
      month: nextMonth,
      inCurrentMonth: false,
    });
  }

  return cells;
};

export const shiftCalendarMonth = (
  year: number,
  month: number,
  delta: number
): { year: number; month: number } => {
  let nextMonth = month + delta;
  let nextYear = year;

  while (nextMonth < 1) {
    nextMonth += 12;
    nextYear -= 1;
  }

  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }

  return { year: nextYear, month: nextMonth };
};

export const formatCalendarMonthLabel = (year: number, month: number): string =>
  `${MONTH_NAMES[month - 1]} ${year}`;
