import type { ReactNode } from 'react';

type PageHeaderActionAlign = 'start' | 'end';

interface PageHeaderProps {
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Vertical alignment of the action on sm+ screens. Default: start (top). */
  actionAlign?: PageHeaderActionAlign;
}

const actionAlignClasses: Record<
  PageHeaderActionAlign,
  { section: string; action: string }
> = {
  start: {
    section: 'sm:items-start',
    action: '',
  },
  end: {
    section: 'sm:items-end',
    action: 'self-end sm:self-auto',
  },
};

export const PageHeader = ({
  label,
  title,
  description,
  action,
  actionAlign = 'start',
}: PageHeaderProps) => {
  const align = actionAlignClasses[actionAlign];

  return (
    <section
      className={`flex flex-col gap-4 sm:flex-row sm:justify-between ${align.section}`}
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{label}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        {description && <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className={`shrink-0 ${align.action}`}>{action}</div>}
    </section>
  );
}
