import { FormEvent, useState } from 'react';
import { HiEnvelope } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../components/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { ApiError, forgotPassword } from '../../lib/api';
import { areRequiredFieldsFilled } from '../../utils/form';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = areRequiredFieldsFilled({ email }, ['email']);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword({ email });
      setSent(true);
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we will send a reset link if an account exists"
      footer={
        <>
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          If an account exists for that email, a reset link has been sent. Check your inbox.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
            />
          </FormField>

          <Button
            type="submit"
            loading={loading}
            loadingText="Sending…"
            className="w-full"
            disabled={!canSubmit}
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
