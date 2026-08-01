import type { EmployeeStatus } from '../../../types';
import { statusLabel } from '../utils';

export const EmployeeStatusBadge = ({ status }: { status: EmployeeStatus }) => {
  const styles: Record<EmployeeStatus, string> = {
    active: 'bg-green-50 text-green-700 ring-green-600/20',
    on_leave: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    terminated: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
