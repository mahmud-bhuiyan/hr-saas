import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface InputFieldProps
  extends FormFieldLayoutProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: string;
  icon?: ReactNode;
  inputClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
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
        <Input
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

InputField.displayName = 'InputField';
