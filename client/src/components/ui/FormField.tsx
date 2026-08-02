import type { LabelHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}

export const FormField = ({
  label,
  children,
  error,
  htmlFor,
  className = '',
  required = false,
}: FormFieldProps) => {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error && !htmlFor && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
