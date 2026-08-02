import { formatLocalDate, getLocalMondayOfWeek } from '../../utils/date';

export type TimesheetTab = 'my-timesheet' | 'approval-queue';

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const getMondayOfWeek = (date: Date): Date => getLocalMondayOfWeek(date);

export const formatWeekOf = (date: Date): string => formatLocalDate(date);

export const getWeekDays = (weekOf: string): string[] => {
  const monday = new Date(`${weekOf}T00:00:00.000Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setUTCDate(day.getUTCDate() + index);
    return formatWeekOf(day);
  });
};

export const shiftWeek = (weekOf: string, deltaWeeks: number): string => {
  const monday = new Date(`${weekOf}T00:00:00.000Z`);
  monday.setUTCDate(monday.getUTCDate() + deltaWeeks * 7);
  return formatWeekOf(monday);
};

export const formatWeekRange = (weekOf: string): string => {
  const days = getWeekDays(weekOf);
  const start = new Date(`${days[0]}T00:00:00.000Z`);
  const end = new Date(`${days[6]}T00:00:00.000Z`);
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endLabel = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `${startLabel} – ${endLabel}`;
};

export const timesheetStatusLabel = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Submitted';
    case 'approved':
      return 'Approved';
    case 'declined':
      return 'Declined';
    default:
      return status;
  }
};

export const timesheetStatusClass = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-700';
    case 'submitted':
      return 'bg-amber-100 text-amber-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const formatDayLabel = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};
