import { type ReactNode } from 'react';
import { FormField } from './FormField';
import { RadioGroup, type RadioOption } from './RadioGroup';
import type { FormFieldLayoutProps } from './formFieldLayout';

interface RadioFieldProps extends FormFieldLayoutProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  optionClassName?: string;
  renderOptionIcon?: (option: RadioOption) => ReactNode;
}

export const RadioField = ({
  label,
  htmlFor,
  required,
  description,
  className,
  controlClassName,
  labelClassName,
  name,
  value,
  onChange,
  options,
  error,
  orientation,
  optionClassName,
  renderOptionIcon,
}: RadioFieldProps) => {
  return (
    <FormField
      label={label}
      htmlFor={htmlFor ?? `${name}-${value}`}
      required={required}
      description={description}
      className={className}
      labelClassName={labelClassName}
    >
      <RadioGroup
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        error={error}
        orientation={orientation}
        wrapperClassName={controlClassName}
        optionClassName={optionClassName}
        renderOptionIcon={renderOptionIcon}
      />
    </FormField>
  );
};
