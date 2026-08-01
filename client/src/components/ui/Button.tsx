import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 disabled:bg-brand-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500 disabled:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className = '',
  children,
  type = 'button',
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) {
  const content = loading ? (loadingText ?? children) : children;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex shrink-0 items-center justify-center">{icon}</span>
      )}
      {content}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex shrink-0 items-center justify-center">{icon}</span>
      )}
    </button>
  );
}
