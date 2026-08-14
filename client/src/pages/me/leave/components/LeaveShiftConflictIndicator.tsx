import type { LeaveShiftConflictSummary } from '../../../../types';

const shiftStatusLabel = (status: LeaveShiftConflictSummary['status']): string => {
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

interface LeaveShiftConflictIndicatorProps {
  conflicts: LeaveShiftConflictSummary[] | undefined;
}

export const LeaveShiftConflictIndicator = ({ conflicts }: LeaveShiftConflictIndicatorProps) => {
  if (!conflicts?.length) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-xs text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
      <p className="font-semibold">
        {conflicts.length} scheduled shift{conflicts.length === 1 ? '' : 's'} overlap
      </p>
      <ul className="mt-2 space-y-2">
        {conflicts.map((conflict) => (
          <li
            key={conflict.id}
            className="border-t border-red-100 pt-2 first:border-t-0 first:pt-0 dark:border-red-500/20"
          >
            <p className="font-medium text-red-950 dark:text-red-100">
              {conflict.date} · {conflict.startTime}–{conflict.endTime}
            </p>
            <p className="text-red-800 dark:text-red-300">
              {conflict.locationName} · {shiftStatusLabel(conflict.status)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
