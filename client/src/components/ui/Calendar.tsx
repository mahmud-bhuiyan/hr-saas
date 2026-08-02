import type { ReactNode } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import {
  buildCalendarDays,
  formatCalendarMonthLabel,
  shiftCalendarMonth,
  WEEKDAY_LABELS,
  type CalendarDay,
} from '../../utils/calendar';
import { Button } from './Button';

export type { CalendarDay };

export interface CalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
  cellMinHeight?: string;
  /** Custom content rendered below the day number inside each cell. */
  renderCell?: (cell: CalendarDay) => ReactNode;
  /** Override the default day number label. */
  renderDayNumber?: (cell: CalendarDay) => ReactNode;
  onDayClick?: (cell: CalendarDay) => void;
  /** Hide prev/next navigation and title bar. */
  hideNavigation?: boolean;
}

export const Calendar = ({
  year,
  month,
  onMonthChange,
  loading = false,
  loadingMessage = 'Loading calendar…',
  className = '',
  cellMinHeight = 'min-h-[5rem]',
  renderCell,
  renderDayNumber,
  onDayClick,
  hideNavigation = false,
}: CalendarProps) => {
  const calendarDays = buildCalendarDays(year, month);

  const goPrev = () => {
    const next = shiftCalendarMonth(year, month, -1);
    onMonthChange(next.year, next.month);
  };

  const goNext = () => {
    const next = shiftCalendarMonth(year, month, 1);
    onMonthChange(next.year, next.month);
  };

  return (
    <div className={`card-surface ${className}`.trim()}>
      {!hideNavigation && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            icon={<HiChevronLeft className="h-4 w-4 text-brand-600" />}
            onClick={goPrev}
          >
            Previous
          </Button>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatCalendarMonthLabel(year, month)}
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
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          {loadingMessage}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((cell) => {
              const dayNumber = renderDayNumber ? (
                renderDayNumber(cell)
              ) : (
                <span
                  className={`text-xs font-medium ${
                    cell.inCurrentMonth
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {cell.day}
                </span>
              );

              const cellContent = renderCell?.(cell);

              return (
                <div
                  key={cell.date}
                  className={`${cellMinHeight} border-b border-r border-slate-100 p-1 text-left dark:border-slate-700${
                    onDayClick ? ' cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
                  }`}
                  onClick={onDayClick ? () => onDayClick(cell) : undefined}
                  onKeyDown={
                    onDayClick
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onDayClick(cell);
                          }
                        }
                      : undefined
                  }
                  role={onDayClick ? 'button' : undefined}
                  tabIndex={onDayClick ? 0 : undefined}
                >
                  {dayNumber}
                  {cellContent ? <div className="mt-1 space-y-0.5">{cellContent}</div> : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
