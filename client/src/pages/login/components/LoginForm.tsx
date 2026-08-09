import { FormEvent, useEffect, useRef } from 'react';
import { HiBuildingOffice2, HiEnvelope, HiLockClosed } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import { reportFormValidity } from '../../../utils/native-validation';

interface LoginFormProps {
  email: string;
  password: string;
  saveForLater: boolean;
  loading: boolean;
  step: 1 | 2;
  passwordError?: string | null;
  formError?: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSaveForLaterChange: (value: boolean) => void;
  onEmailContinue: () => void;
  onBackToEmail: () => void;
  onSubmit: (event: FormEvent) => void;
}

export const LoginForm = ({
  email,
  password,
  saveForLater,
  loading,
  step,
  passwordError,
  formError,
  onEmailChange,
  onPasswordChange,
  onSaveForLaterChange,
  onEmailContinue,
  onBackToEmail,
  onSubmit,
}: LoginFormProps) => {
  const { displayName } = useSiteConfig();
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = passwordRef.current;
    if (!input || step !== 2) {
      return;
    }

    const message = passwordError ?? formError;
    if (!message) {
      input.setCustomValidity('');
      return;
    }

    input.setCustomValidity(message);
    input.reportValidity();
  }, [passwordError, formError, step]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reportFormValidity(event.currentTarget)) {
      return;
    }

    if (step === 1) {
      onEmailContinue();
      return;
    }

    void onSubmit(event);
  };

  return (
    <AuthLayout
      title={`Login to ${displayName}`}
      subtitle={
        step === 2 ? (
          <>
            Signing in as{' '}
            <span className="font-medium text-slate-700">{email}</span>
            {' · '}
            <button
              type="button"
              onClick={onBackToEmail}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Change
            </button>
          </>
        ) : undefined
      }
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
            />

            <Button type="submit" className="w-full py-3">
              Continue
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 transition hover:bg-slate-50"
            >
              <HiBuildingOffice2 className="h-5 w-5 text-brand-600" />
              Register your company
            </Link>
          </>
        ) : (
          <>
            <PasswordInput
              ref={passwordRef}
              id="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={saveForLater}
                  onChange={(e) => onSaveForLaterChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3"
              loadingText="Signing in…"
            >
              Sign in
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
};
