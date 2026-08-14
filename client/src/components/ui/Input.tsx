import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { HiXMark } from 'react-icons/hi2';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
  clearable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      className = '',
      id,
      icon,
      onChange,
      wrapperClassName = '',
      clearable = false,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.target.setCustomValidity('');
      onChange?.(event);
    };

    const handleClear = () => {
      onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.focus();
      }
    };

    const hasValue = String(value ?? '').length > 0;
    const showClear = clearable && hasValue && !disabled;

    const fieldClassName = `relative flex w-full items-center gap-1.5 rounded-lg border bg-white py-2.5 pl-2 pr-3 text-sm shadow-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 ${
      error
        ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60'
        : 'border-slate-300 focus-within:border-brand-500'
    }`;

    const inputClassName = `min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 ${
      clearable ? 'pr-6' : ''
    } ${className}`;

    return (
      <div className={wrapperClassName}>
        <div className={fieldClassName}>
          {icon && (
            <span className="pointer-events-none shrink-0 text-slate-400" aria-hidden>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            className={inputClassName}
            {...props}
          />
          {showClear && (
            <button
              type="button"
              aria-label="Clear"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            >
              <HiXMark className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
