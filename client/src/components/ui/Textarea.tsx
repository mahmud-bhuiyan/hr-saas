import type { ReactNode, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  icon?: ReactNode;
}

export const Textarea = ({ error, className = '', id, icon, ...props }: TextareaProps) => {
  return (
    <div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden>
            {icon}
          </span>
        )}
        <textarea
          id={id}
          className={`block w-full rounded-lg border bg-white py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
              : 'border-slate-300 focus:border-brand-500'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
