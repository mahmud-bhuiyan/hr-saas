import type { RegistrationRequest } from '../../../types';

const statusLabels: Record<
  NonNullable<RegistrationRequest['subscriptionStatus']>,
  string
> = {
  exempt: 'Exempt',
  none: 'No subscription',
  trialing: 'Trialing',
  active: 'Active',
  past_due: 'Past due',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
};

const statusClasses: Record<
  NonNullable<RegistrationRequest['subscriptionStatus']>,
  string
> = {
  exempt: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  none: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  trialing: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  active: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  past_due: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  canceled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  incomplete: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};

export const SubscriptionStatusBadge = ({
  status,
  seatCount,
}: {
  status?: RegistrationRequest['subscriptionStatus'];
  seatCount?: number;
}) => {
  const resolved = status ?? 'none';
  const label = statusLabels[resolved];

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[resolved]}`}
      >
        {label}
      </span>
      {typeof seatCount === 'number' && resolved !== 'exempt' && resolved !== 'none' && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{seatCount} seats</span>
      )}
    </span>
  );
};
