import { Calendar } from '../../../../components/ui/Calendar';
import type { LeaveCalendarEntry } from '../../../../types';
import { leaveStatusClass, leaveStatusLabel, leaveTypeLabel } from '../utils';

interface LeaveCalendarProps {
  year: number;
  month: number;
  entries: LeaveCalendarEntry[];
  loading: boolean;
  onMonthChange: (year: number, month: number) => void;
}

const dateInRange = (dateStr: string, start: string, end: string): boolean =>
  dateStr >= start && dateStr <= end;

export const LeaveCalendar = ({
  year,
  month,
  entries,
  loading,
  onMonthChange,
}: LeaveCalendarProps) => {
  const entriesForDate = (dateStr: string): LeaveCalendarEntry[] =>
    entries.filter((entry) => dateInRange(dateStr, entry.startDate, entry.endDate));

  return (
    <Calendar
      year={year}
      month={month}
      loading={loading}
      onMonthChange={onMonthChange}
      renderCell={(cell) => {
        if (!cell.inCurrentMonth) {
          return null;
        }

        const dayEntries = entriesForDate(cell.date);

        return (
          <>
            {dayEntries.slice(0, 2).map((entry) => (
              <div
                key={entry.id}
                className={`truncate rounded px-1 py-0.5 text-[10px] border ${leaveStatusClass(entry.status)}`}
                title={`${entry.employeeName} — ${leaveTypeLabel(entry.type)}`}
              >
                {entry.employeeName.split(' ')[0]} · {leaveStatusLabel(entry.status)}
              </div>
            ))}
            {dayEntries.length > 2 && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                +{dayEntries.length - 2} more
              </p>
            )}
          </>
        );
      }}
    />
  );
};
