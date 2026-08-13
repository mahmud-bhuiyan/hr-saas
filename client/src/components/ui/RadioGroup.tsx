import type { ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  wrapperClassName?: string;
  optionClassName?: string;
  renderOptionIcon?: (option: RadioOption) => ReactNode;
}

export const RadioGroup = ({
  name,
  value,
  onChange,
  options,
  error,
  orientation = 'vertical',
  wrapperClassName = '',
  optionClassName = '',
  renderOptionIcon,
}: RadioGroupProps) => {
  const layoutClassName =
    orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2';

  return (
    <div className={wrapperClassName}>
      <div className={layoutClassName} role="radiogroup">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300 ${
                option.disabled ? 'cursor-not-allowed opacity-50' : ''
              } ${optionClassName}`}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={(event) => onChange(event.target.value)}
                className="mt-0.5 h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-medium">
                  {renderOptionIcon?.(option)}
                  {option.label}
                </span>
                {option.description && (
                  <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
