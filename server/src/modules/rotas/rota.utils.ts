import { formatDateOnly, getWeekDays, parseDateOnly, parseWeekOf } from '../timesheets/timesheet.utils.js';

export { formatDateOnly, getWeekDays, parseDateOnly, parseWeekOf };

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const parseTime = (time: string): { hours: number; minutes: number } => {
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    throw new Error('Invalid time format');
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
};

export const timeToMinutes = (time: string): number => {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
};

export const timesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const startMinutesA = timeToMinutes(startA);
  const endMinutesA = timeToMinutes(endA);
  const startMinutesB = timeToMinutes(startB);
  const endMinutesB = timeToMinutes(endB);

  return startMinutesA < endMinutesB && endMinutesA > startMinutesB;
};

export const assertEndAfterStart = (startTime: string, endTime: string): void => {
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new Error('endTime must be after startTime');
  }
};

export const getWeekDateStrings = (weekOfStr: string): string[] => {
  const monday = parseWeekOf(weekOfStr);
  return getWeekDays(monday).map(formatDateOnly);
};
