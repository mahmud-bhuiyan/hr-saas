import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', id, icon, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.target.setCustomValidity('');
      onChange?.(event);
    };

    const fieldClassName = `flex w-full items-center gap-1.5 rounded-lg border bg-white py-2.5 pl-2 pr-3 text-sm shadow-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 ${
      error
        ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60'
        : 'border-slate-300 focus-within:border-brand-500'
    }`;

    return (
      <div>
        <div className={fieldClassName}>
          {icon && (
            <span className="pointer-events-none shrink-0 text-slate-400" aria-hidden>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            onChange={handleChange}
            className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
