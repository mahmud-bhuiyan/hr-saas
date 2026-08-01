import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export type ButtonDisplay = 'both' | 'icon' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  /** Controls icon/text layout: `both`, `icon` only, or `text` only. Omit to show whatever is passed. */
  display?: ButtonDisplay;
}

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 disabled:bg-brand-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500 disabled:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
};

export const Button = ({
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className = '',
  children,
  type = 'button',
  icon,
  iconPosition = 'left',
  display,
  'aria-label': ariaLabel,
  title,
  ...props
}: ButtonProps) => {
  const showIcon = Boolean(icon) && display !== 'text';
  const showContent = display !== 'icon';
  const isIconOnly = display === 'icon';
  const textLabel = typeof children === 'string' ? children : undefined;

  const content = loading
    ? (loadingText ?? (showContent ? children : undefined))
    : showContent
      ? children
      : undefined;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel ?? (isIconOnly ? textLabel : undefined)}
      title={title ?? (isIconOnly ? textLabel : undefined)}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${isIconOnly ? 'px-2.5' : ''} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && showIcon && iconPosition === 'left' && (
        <span className="flex shrink-0 items-center justify-center">{icon}</span>
      )}
      {content}
      {!loading && showIcon && iconPosition === 'right' && (
        <span className="flex shrink-0 items-center justify-center">{icon}</span>
      )}
    </button>
  );
};
