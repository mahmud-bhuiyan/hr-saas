import type { LeaveOverlapSummary } from '../../../types';
import { formatDateRange, leaveStatusLabel } from '../utils';

interface LeaveOverlapIndicatorProps {
  overlaps: LeaveOverlapSummary[] | undefined;
}

export const LeaveOverlapIndicator = ({ overlaps }: LeaveOverlapIndicatorProps) => {
  if (!overlaps?.length) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-900">
      <p className="font-semibold">
        {overlaps.length} other employee{overlaps.length === 1 ? '' : 's'} off same dates
      </p>
      <ul className="mt-2 space-y-2">
        {overlaps.map((overlap) => (
          <li key={overlap.id} className="border-t border-amber-100 pt-2 first:border-t-0 first:pt-0">
            <p className="font-medium text-amber-950">{overlap.employeeName}</p>
            <p className="text-amber-800">
              {formatDateRange(overlap.startDate, overlap.endDate, overlap.halfDay)}
              {' · '}
              {leaveStatusLabel(overlap.status)}
            </p>
            {overlap.reason ? (
              <p className="mt-0.5 italic text-amber-700">&ldquo;{overlap.reason}&rdquo;</p>
            ) : (
              <p className="mt-0.5 text-amber-600">No reason provided</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
