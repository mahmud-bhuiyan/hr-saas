import { type ReactNode, type TextareaHTMLAttributes } from 'react';
import { FormField } from './FormField';
import { Textarea } from './Textarea';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface TextareaFieldProps
  extends FormFieldLayoutProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  error?: string;
  icon?: ReactNode;
  textareaClassName?: string;
}

export const TextareaField = ({
  label,
  htmlFor,
  required,
  description,
  className,
  controlClassName,
  labelClassName,
  error,
  icon,
  textareaClassName,
  id,
  ...props
}: TextareaFieldProps) => {
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
      <Textarea
        id={fieldId}
        error={error}
        icon={icon}
        wrapperClassName={controlClassName}
        className={textareaClassName}
        {...props}
      />
    </FormField>
  );
};
