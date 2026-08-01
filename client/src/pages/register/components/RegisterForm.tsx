import { FormEvent } from 'react';
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
import type { RegisterPendingResponse } from '../../../types';

interface RegisterFormProps {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  loading: boolean;
  canSubmit: boolean;
  onCompanyNameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export const RegisterForm = ({
  companyName,
  firstName,
  lastName,
  email,
  password,
  loading,
  canSubmit,
  onCompanyNameChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) => {
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
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <FormField label="Company name" htmlFor="companyName">
          <Input
            id="companyName"
            required
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="Acme Ltd"
            icon={<HiBuildingOffice2 className="h-5 w-5 text-brand-600" />}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Jane"
              icon={<HiUser className="h-5 w-5 text-brand-600" />}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
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
            onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
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

export const RegisterSuccessView = ({ submitted }: { submitted: RegisterPendingResponse }) => {
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
