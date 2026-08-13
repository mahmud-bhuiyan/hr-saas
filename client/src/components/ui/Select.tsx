import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  icon?: ReactNode;
}

export const Select = ({ error, className = '', id, icon, children, ...props }: SelectProps) => {
  return (
    <div>
      <div
        className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60'
            : 'border-slate-300 focus-within:border-brand-500'
        }`}
      >
        {icon && (
          <span className="pointer-events-none shrink-0 text-slate-400" aria-hidden>
            {icon}
          </span>
        )}
        <select
          id={id}
          className={`ui-select min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-900 focus:outline-none focus:ring-0 dark:text-slate-100 ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
