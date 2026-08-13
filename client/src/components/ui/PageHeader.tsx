import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';

type PageHeaderActionAlign = 'start' | 'end';

interface PageHeaderBackLink {
  to: string;
  label: string;
}

interface PageHeaderProps {
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Optional back navigation link shown above the header. */
  back?: PageHeaderBackLink;
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
  back,
  actionAlign = 'start',
}: PageHeaderProps) => {
  const align = actionAlignClasses[actionAlign];

  return (
    <div className={back ? 'space-y-4' : undefined}>
      {back && (
        <Link
          to={back.to}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <HiArrowLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}

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
    </div>
  );
};
