import type { Shift, ShiftStatus } from '../../types';
import {
  DAY_LABELS,
  formatDayLabel,
  formatWeekOf,
  formatWeekRange,
  getMondayOfWeek,
  getWeekDays,
  shiftWeek,
} from '../timesheets/utils';

export {
  DAY_LABELS,
  formatDayLabel,
  formatWeekOf,
  formatWeekRange,
  getMondayOfWeek,
  getWeekDays,
  shiftWeek,
};

export type RotasTab = 'weekly-rota' | 'my-shifts' | 'open-shifts';

export const shiftStatusLabel = (status: ShiftStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'open':
      return 'Open';
    default:
      return status;
  }
};

export const shiftStatusClass = (status: ShiftStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'open':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const formatShiftTime = (startTime: string, endTime: string): string =>
  `${startTime} – ${endTime}`;

export const formatEmployeeName = (shift: Shift): string => {
  if (shift.employee) {
    return `${shift.employee.firstName} ${shift.employee.lastName}`;
  }

  if (shift.status === 'open' || !shift.employeeId) {
    return 'Open shift';
  }

  return 'Unassigned';
};

export const groupShiftsByDate = (shifts: Shift[], weekDays: string[]): Map<string, Shift[]> => {
  const grouped = new Map<string, Shift[]>(weekDays.map((date) => [date, []]));

  for (const shift of shifts) {
    const bucket = grouped.get(shift.date);
    if (bucket) {
      bucket.push(shift);
    }
  }

  for (const [, bucket] of grouped) {
    bucket.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return grouped;
};

export const filterMyShifts = (shifts: Shift[]): Shift[] =>
  shifts.filter((shift) => shift.employeeId && shift.status !== 'open');

export const filterOpenShifts = (shifts: Shift[]): Shift[] =>
  shifts.filter((shift) => shift.status === 'open' && !shift.employeeId);

export const filterManageableShifts = (shifts: Shift[]): Shift[] => shifts;

export interface ShiftFormState {
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  employeeId: string;
  role: string;
}

export const emptyShiftForm = (date = ''): ShiftFormState => ({
  date,
  startTime: '09:00',
  endTime: '17:00',
  locationId: '',
  employeeId: '',
  role: '',
});

export const shiftToFormState = (shift: Shift): ShiftFormState => ({
  date: shift.date,
  startTime: shift.startTime,
  endTime: shift.endTime,
  locationId: shift.locationId,
  employeeId: shift.employeeId ?? '',
  role: shift.role ?? '',
});
