import { FormEvent } from 'react';
import { HiEnvelope, HiLockClosed } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';

interface LoginFormProps {
  email: string;
  password: string;
  saveForLater: boolean;
  loading: boolean;
  canSubmit: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSaveForLaterChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}

export const LoginForm = ({
  email,
  password,
  saveForLater,
  loading,
  canSubmit,
  onEmailChange,
  onPasswordChange,
  onSaveForLaterChange,
  onSubmit,
}: LoginFormProps) => {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your company HR workspace"
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Register your company
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@company.com"
            icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={saveForLater}
            onChange={(e) => onSaveForLaterChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Save for later
        </label>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          loadingText="Signing in…"
          disabled={!canSubmit}
        >
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
