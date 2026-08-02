import type { LeaveRequestStatus, LeaveType } from '../../types';

export const leaveTypeLabel = (type: LeaveType): string => {
  switch (type) {
    case 'annual':
      return 'Annual';
    case 'sick':
      return 'Sick';
    case 'unpaid':
      return 'Unpaid';
    case 'planned':
      return 'Planned leave';
    default:
      return type;
  }
};

export const leaveStatusLabel = (status: LeaveRequestStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'declined':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const leaveStatusClass = (status: LeaveRequestStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'declined':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30';
    case 'cancelled':
      return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600';
  }
};

export const formatDateRange = (startDate: string, endDate: string, halfDay: boolean): string => {
  if (startDate === endDate) {
    return halfDay ? `${startDate} (half day)` : startDate;
  }
  return `${startDate} – ${endDate}`;
};

export type LeaveTab = 'my-leave' | 'employee-leave' | 'approvals' | 'calendar';

export const emptyLeaveForm = {
  type: 'annual' as LeaveType,
  startDate: '',
  endDate: '',
  halfDay: false,
  reason: '',
};
