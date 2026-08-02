import { FormEvent, useState } from 'react';
import { HiLockClosed } from 'react-icons/hi2';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../components/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { ApiError, resetPassword } from '../../lib/api';
import { areRequiredFieldsFilled } from '../../utils/form';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    areRequiredFieldsFilled({ password, confirmPassword }, ['password', 'confirmPassword']) &&
    password === confirmPassword &&
    Boolean(token);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ token, password });
      toast.success(result.message);
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is missing or invalid.">
        <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a new password for your account"
      footer={
        <>
          Back to{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <FormField label="New password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        {confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-600">Passwords do not match</p>
        )}

        <Button
          type="submit"
          loading={loading}
          loadingText="Saving…"
          className="w-full"
          disabled={!canSubmit}
        >
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};
