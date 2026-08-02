import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import type { Shift } from '../../../types';
import {
  DAY_LABELS,
  formatDayLabel,
  formatEmployeeName,
  formatShiftTime,
  getWeekDays,
  groupShiftsByDate,
} from '../utils';
import { ShiftStatusBadge } from './ShiftStatusBadge';

interface RotaWeekGridProps {
  weekOf: string;
  shifts: Shift[];
  loading: boolean;
  actionLoadingId: string | null;
  canManage: boolean;
  onAddShift: (date: string) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shift: Shift) => void;
}

export const RotaWeekGrid = ({
  weekOf,
  shifts,
  loading,
  actionLoadingId,
  canManage,
  onAddShift,
  onEditShift,
  onDeleteShift,
}: RotaWeekGridProps) => {
  const weekDays = getWeekDays(weekOf);
  const grouped = groupShiftsByDate(shifts, weekDays);

  if (loading) {
    return (
      <div className="card-surface flex min-h-48 items-center justify-center">
        <Spinner className="h-8 w-8 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="card-surface overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {weekDays.map((date, index) => (
              <th
                key={date}
                className="min-w-[9rem] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <div>{DAY_LABELS[index]}</div>
                <div className="mt-1 font-normal normal-case text-slate-700 dark:text-slate-200">
                  {formatDayLabel(date)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {weekDays.map((date) => {
              const dayShifts = grouped.get(date) ?? [];

              return (
                <td
                  key={date}
                  className="align-top border-r border-slate-100 px-2 py-3 last:border-r-0 dark:border-slate-800"
                >
                  <div className="flex min-h-[8rem] flex-col gap-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left dark:border-slate-700 dark:bg-slate-800/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {formatShiftTime(shift.startTime, shift.endTime)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                              {formatEmployeeName(shift)}
                            </p>
                            {shift.location?.name && (
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {shift.location.name}
                              </p>
                            )}
                            {shift.role && (
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {shift.role}
                              </p>
                            )}
                          </div>
                          <ShiftStatusBadge status={shift.status} />
                        </div>

                        {canManage && (
                          <div className="mt-2 flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              className="px-2 py-1 text-xs"
                              icon={<HiPencil className="h-3.5 w-3.5 text-brand-600" />}
                              onClick={() => onEditShift(shift)}
                              disabled={actionLoadingId === shift.id}
                            >
                              Edit
                            </Button>
                            {shift.status === 'draft' && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="px-2 py-1 text-xs"
                                icon={<HiTrash className="h-3.5 w-3.5 text-red-500" />}
                                loading={actionLoadingId === shift.id}
                                loadingText="Deleting"
                                onClick={() => onDeleteShift(shift)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {canManage && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-auto w-full justify-center py-1.5 text-xs"
                        icon={<HiPlus className="h-3.5 w-3.5 text-brand-600" />}
                        onClick={() => onAddShift(date)}
                      >
                        Add shift
                      </Button>
                    )}

                    {!canManage && dayShifts.length === 0 && (
                      <p className="py-6 text-center text-xs text-slate-400">No shifts</p>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
