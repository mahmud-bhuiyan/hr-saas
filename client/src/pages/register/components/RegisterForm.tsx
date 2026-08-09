import { FormEvent, useEffect } from 'react';
import {
  HiBuildingOffice2,
  HiEnvelope,
  HiLockClosed,
  HiUser,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import type { RegisterPendingResponse } from '../../../types';
import { reportFormValidity, reportInputValidity } from '../../../utils/native-validation';

type RegisterField = 'companyName' | 'firstName' | 'lastName' | 'email' | 'password';

interface RegisterFormProps {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  loading: boolean;
  fieldErrors?: Partial<Record<RegisterField, string>>;
  formError?: string | null;
  onCompanyNameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const RegisterForm = ({
  companyName,
  firstName,
  lastName,
  email,
  password,
  loading,
  fieldErrors = {},
  formError,
  onCompanyNameChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) => {
  const { displayName } = useSiteConfig();

  useEffect(() => {
    const field = Object.keys(fieldErrors)[0] as RegisterField | undefined;

    if (field && fieldErrors[field]) {
      reportInputValidity(
        document.getElementById(field) as HTMLInputElement | null,
        fieldErrors[field]!
      );
      return;
    }

    if (formError) {
      reportInputValidity(
        document.getElementById('companyName') as HTMLInputElement | null,
        formError
      );
    }
  }, [fieldErrors, formError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reportFormValidity(event.currentTarget)) {
      return;
    }

    onSubmit(event);
  };

  return (
    <AuthLayout
      title={`Register with ${displayName}`}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Company name" htmlFor="companyName" required>
          <Input
            id="companyName"
            name="companyName"
            required
            minLength={2}
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="Acme Ltd"
            icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName" required>
            <Input
              id="firstName"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Jane"
              icon={<HiUser className="h-4 w-4 text-brand-600" />}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" required>
            <Input
              id="lastName"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Admin"
              icon={<HiUser className="h-4 w-4 text-brand-600" />}
            />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@acme.com"
            icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="At least 8 characters"
            icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <Button
          type="submit"
          loading={loading}
          loadingText="Submitting…"
          className="w-full py-3"
        >
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
};

export const RegisterSuccessView = ({ submitted }: { submitted: RegisterPendingResponse }) => {
  const { displayName } = useSiteConfig();

  return (
    <AuthLayout
      title="Registration submitted"
      subtitle={`Your request is awaiting ${displayName} super admin approval`}
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
};
