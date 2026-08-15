import type { LeaveBalance } from "../../../../types";

interface LeaveBalanceSummaryProps {
  balance: LeaveBalance | undefined;
  loading: boolean;
  missingEmployeeLink?: boolean;
}

export const LeaveBalanceSummary = ({
  balance,
  loading,
  missingEmployeeLink = false,
}: LeaveBalanceSummaryProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (missingEmployeeLink) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No employee record linked to your account. Contact your administrator to
        link your profile before requesting leave. You can still review staff
        leave on the Employee leave tab.
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const cards = [
    {
      label: "Entitlement",
      value: balance.entitlement,
      note: `${balance.year} annual leave`,
    },
    ...(balance.carriedOver > 0
      ? [
          {
            label: "Carried over",
            value: balance.carriedOver,
            note: "From previous year",
          },
        ]
      : []),
    { label: "Taken", value: balance.taken, note: "Approved days used" },
    { label: "Pending", value: balance.pending, note: "Awaiting approval" },
    { label: "Remaining", value: balance.remaining, note: "Available days" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="card-surface px-4 py-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {card.note}
          </p>
        </div>
      ))}
    </div>
  );
};
