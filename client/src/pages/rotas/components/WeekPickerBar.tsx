import { HiCalendarDays, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { formatWeekOf, formatWeekRange, getMondayOfWeek, shiftWeek } from '../utils';

interface WeekPickerBarProps {
  weekOf: string;
  onWeekChange: (weekOf: string) => void;
}

export const WeekPickerBar = ({ weekOf, onWeekChange }: WeekPickerBarProps) => (
  <div className="card-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Week
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {formatWeekRange(weekOf)}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="px-2 py-2"
        icon={<HiChevronLeft className="h-4 w-4 text-brand-600" />}
        onClick={() => onWeekChange(shiftWeek(weekOf, -1))}
        aria-label="Previous week"
      />
      <Button
        type="button"
        variant="secondary"
        className="px-2 py-2"
        icon={<HiChevronRight className="h-4 w-4 text-brand-600" />}
        onClick={() => onWeekChange(shiftWeek(weekOf, +1))}
        aria-label="Next week"
      />
      <Button
        type="button"
        variant="secondary"
        icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
        onClick={() => onWeekChange(formatWeekOf(getMondayOfWeek(new Date())))}
      >
        This week
      </Button>
    </div>
  </div>
);
