import type { ReactNode } from 'react';

/** Shared layout props for labeled form field wrappers. */
export interface FormFieldLayoutProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: ReactNode;
  /** Width/spacing on the outer field wrapper. */
  className?: string;
  /** Height/width classes applied to the control wrapper. */
  controlClassName?: string;
  labelClassName?: string;
}
