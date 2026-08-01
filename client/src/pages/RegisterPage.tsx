import { FormEvent, useState } from 'react';
import { HiBuildingOffice2, HiEnvelope, HiLockClosed, HiUser } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { ApiError, register } from '../lib/api';
import type { RegisterPendingResponse } from '../types';
import { areRequiredFieldsFilled } from '../utils/form';

export function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<RegisterPendingResponse | null>(null);

  const canSubmit =
    areRequiredFieldsFilled({ companyName, email, password }, ['companyName', 'email', 'password']) &&
    password.length >= 8;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register({
        companyName,
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      setSubmitted(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout
        title="Registration submitted"
        subtitle="Your request is awaiting super admin approval"
        footer={
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Back to sign in
          </Link>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {submitted.message}
          </div>
          <dl className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Company</dt>
              <dd className="font-medium text-slate-900">{submitted.companyName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Admin email</dt>
              <dd className="font-medium text-slate-900">{submitted.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium capitalize text-amber-700">{submitted.status}</dd>
            </div>
          </dl>
          <p className="text-sm text-slate-500">
            You will be able to sign in once a super admin approves your company.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register your company"
      subtitle="Submit your company for super admin approval"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <FormField label="Company name" htmlFor="companyName">
          <Input
            id="companyName"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Ltd"
            icon={<HiBuildingOffice2 className="h-5 w-5 text-brand-600" />}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              icon={<HiUser className="h-5 w-5 text-brand-600" />}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Admin"
              icon={<HiUser className="h-5 w-5 text-brand-600" />}
            />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@acme.com"
            icon={<HiEnvelope className="h-5 w-5 text-brand-600" />}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            icon={<HiLockClosed className="h-5 w-5 text-brand-600" />}
          />
        </FormField>

        <Button
          type="submit"
          loading={loading}
          loadingText="Submitting…"
          className="w-full"
          disabled={!canSubmit}
        >
          Submit for approval
        </Button>
      </form>
    </AuthLayout>
  );
}
