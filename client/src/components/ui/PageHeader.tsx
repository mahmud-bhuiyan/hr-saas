import type { ReactNode } from 'react';

interface PageHeaderProps {
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export const PageHeader = ({ label, title, description, action }: PageHeaderProps) => {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{label}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
