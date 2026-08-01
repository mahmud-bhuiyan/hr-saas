import type { LabelHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  children: ReactNode;
  error?: string;
}

export function FormField({ label, children, error, htmlFor, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && !htmlFor && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
