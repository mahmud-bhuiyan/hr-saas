import { type ReactNode, type SelectHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { Select } from "./Select";
import type { FormFieldLayoutProps } from "./formFieldLayout";

export interface SelectFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps
  extends
    FormFieldLayoutProps,
    Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      "className" | "children" | "size"
    > {
  error?: string;
  icon?: ReactNode;
  options?: SelectFieldOption[];
  children?: ReactNode;
  selectClassName?: string;
  size?: "default" | "sm";
}

export const SelectField = ({
  label,
  htmlFor,
  required,
  description,
  className,
  controlClassName,
  labelClassName,
  error,
  icon,
  options,
  children,
  selectClassName,
  id,
  ...props
}: SelectFieldProps) => {
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
      <Select
        id={fieldId}
        error={error}
        icon={icon}
        wrapperClassName={controlClassName}
        className={selectClassName}
        {...props}
      >
        {children ??
          options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
      </Select>
    </FormField>
  );
};
