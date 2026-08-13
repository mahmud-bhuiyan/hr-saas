import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FileInput } from './FileInput';
import { FormField } from './FormField';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface FileFieldProps
  extends FormFieldLayoutProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value' | 'className'> {
  error?: string;
  icon?: ReactNode;
  fileName?: string | null;
  placeholder?: string;
  onFileChange?: (file: File | null) => void;
  buttonClassName?: string;
}

export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(
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
      fileName,
      placeholder,
      onFileChange,
      buttonClassName,
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
        <FileInput
          ref={ref}
          id={fieldId}
          error={error}
          icon={icon}
          fileName={fileName}
          placeholder={placeholder}
          onFileChange={onFileChange}
          wrapperClassName={controlClassName}
          buttonClassName={buttonClassName}
          {...props}
        />
      </FormField>
    );
  }
);

FileField.displayName = 'FileField';
