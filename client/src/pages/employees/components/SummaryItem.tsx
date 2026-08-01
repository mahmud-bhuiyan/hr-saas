import type { ReactNode } from 'react';

interface SummaryItemProps {
  label: string;
  value: string;
  icon?: ReactNode;
  capitalize?: boolean;
}

export const SummaryItem = ({ label, value, icon, capitalize }: SummaryItemProps) => {
  if (icon) {
    return (
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <dt className="text-xs font-medium text-slate-500">{label}</dt>
          <dd
            className={`mt-0.5 truncate text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}
          >
            {value}
          </dd>
        </div>
      </div>
    );
  }

  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
};
