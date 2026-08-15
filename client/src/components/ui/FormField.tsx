import type { LabelHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  description?: ReactNode;
  labelClassName?: string;
}

export const FormField = ({
  label,
  children,
  error,
  htmlFor,
  className = "",
  required = false,
  description,
  labelClassName = "",
}: FormFieldProps) => {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={`mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300 ${labelClassName}`}
      >
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {description && (
        <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {children}
      {error && !htmlFor && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
