import type { ShiftStatus } from '../../../types';
import { shiftStatusClass, shiftStatusLabel } from '../utils';

interface ShiftStatusBadgeProps {
  status: ShiftStatus;
}

export const ShiftStatusBadge = ({ status }: ShiftStatusBadgeProps) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${shiftStatusClass(status)}`}
  >
    {shiftStatusLabel(status)}
  </span>
);
