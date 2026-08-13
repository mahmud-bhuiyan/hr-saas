import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { Input } from './Input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className = '', id, disabled, icon, wrapperClassName = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={`relative ${wrapperClassName}`}>
        <Input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          error={error}
          disabled={disabled}
          icon={icon}
          className={`pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          disabled={disabled}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2 top-2.5 rounded-md p-1 text-slate-400 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <HiEyeSlash className="h-4 w-4 text-slate-500" aria-hidden />
          ) : (
            <HiEye className="h-4 w-4 text-brand-600" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
