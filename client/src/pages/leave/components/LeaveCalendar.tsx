import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { LeaveCalendarEntry } from '../../../types';
import { leaveStatusClass, leaveStatusLabel, leaveTypeLabel, MONTH_NAMES } from '../utils';

interface LeaveCalendarProps {
  year: number;
  month: number;
  entries: LeaveCalendarEntry[];
  loading: boolean;
  onMonthChange: (year: number, month: number) => void;
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const getFirstWeekday = (year: number, month: number): number => {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
};

const dateInRange = (dateStr: string, start: string, end: string): boolean => {
  return dateStr >= start && dateStr <= end;
};

export const LeaveCalendar = ({
  year,
  month,
  entries,
  loading,
  onMonthChange,
}: LeaveCalendarProps) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const blanks = Array.from({ length: firstWeekday }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const goPrev = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const pad = (day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const entriesForDay = (day: number): LeaveCalendarEntry[] => {
    const dateStr = pad(day);
    return entries.filter((e) => dateInRange(dateStr, e.startDate, e.endDate));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          icon={<HiChevronLeft className="h-4 w-4 text-brand-600" />}
          onClick={goPrev}
        >
          Previous
        </Button>
        <h3 className="text-sm font-semibold text-slate-900">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          icon={<HiChevronRight className="h-4 w-4 text-brand-600" />}
          onClick={goNext}
        >
          Next
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Loading calendar…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-[5rem] border-b border-r border-slate-100 bg-slate-50/50" />
            ))}
            {days.map((day) => {
              const dayEntries = entriesForDay(day);
              return (
                <div
                  key={day}
                  className="min-h-[5rem] border-b border-r border-slate-100 p-1 text-left"
                >
                  <span className="text-xs font-medium text-slate-700">{day}</span>
                  <div className="mt-1 space-y-0.5">
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
                      <p className="text-[10px] text-slate-500">+{dayEntries.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
