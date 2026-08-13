import { forwardRef, type InputHTMLAttributes } from 'react';
import { Checkbox } from './Checkbox';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface CheckboxFieldProps
  extends Omit<FormFieldLayoutProps, 'htmlFor'>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  error?: string;
  layout?: 'inline' | 'stacked';
  checkboxClassName?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      label,
      required,
      description,
      className = '',
      controlClassName,
      labelClassName = '',
      error,
      layout = 'inline',
      checkboxClassName,
      id,
      ...props
    },
    ref
  ) => {
    if (layout === 'stacked') {
      return (
        <div className={className}>
          <p
            className={`mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300 ${labelClassName}`}
          >
            {label}
            {required && (
              <span className="text-red-600" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </p>
          {description && (
            <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
          <Checkbox
            ref={ref}
            id={id}
            error={error}
            wrapperClassName={controlClassName}
            className={checkboxClassName}
            {...props}
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <label
          htmlFor={id}
          className={`flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300 ${labelClassName}`}
        >
          <Checkbox
            ref={ref}
            id={id}
            wrapperClassName={controlClassName}
            className={checkboxClassName}
            {...props}
          />
          <span className="min-w-0">
            <span className="font-medium">
              {label}
              {required && (
                <span className="text-red-600" aria-hidden="true">
                  {' '}
                  *
                </span>
              )}
            </span>
            {description && (
              <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </span>
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
