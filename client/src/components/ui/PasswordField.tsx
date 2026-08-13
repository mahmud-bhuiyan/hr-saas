import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface PasswordFieldProps
  extends FormFieldLayoutProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  error?: string;
  icon?: ReactNode;
  inputClassName?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      htmlFor,
      required,
      description,
      className,
      controlClassName,
      labelClassName,
      error,
      icon,
      inputClassName,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id ?? htmlFor;

    return (
      <FormField
        label={label}
        htmlFor={fieldId}
        required={required}
        description={description}
        className={className}
        labelClassName={labelClassName}
      >
        <PasswordInput
          ref={ref}
          id={fieldId}
          error={error}
          icon={icon}
          wrapperClassName={controlClassName}
          className={inputClassName}
          {...props}
        />
      </FormField>
    );
  }
);

PasswordField.displayName = 'PasswordField';
