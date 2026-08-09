import { useState } from 'react';
import { ApiError, register } from '../../lib/api';
import type { RegisterPendingResponse } from '../../types';
import { RegisterForm, RegisterSuccessView } from './components/RegisterForm';

type RegisterField = 'companyName' | 'firstName' | 'lastName' | 'email' | 'password';

type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

const mapRegisterApiError = (message: string): { fieldErrors: RegisterFieldErrors; formError?: string } => {
  const lower = message.toLowerCase();

  if (lower.includes('email already')) {
    return { fieldErrors: { email: message } };
  }

  if (lower.includes('company name')) {
    return { fieldErrors: { companyName: message } };
  }

  if (lower.includes('first name')) {
    return { fieldErrors: { firstName: message } };
  }

  if (lower.includes('last name')) {
    return { fieldErrors: { lastName: message } };
  }

  if (lower.includes('password')) {
    return { fieldErrors: { password: message } };
  }

  if (lower.includes('email')) {
    return { fieldErrors: { email: message } };
  }

  return { fieldErrors: {}, formError: message };
};

export const RegisterPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<RegisterPendingResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const result = await register({
        companyName,
        email,
        password,
        firstName,
        lastName,
      });
      setSubmitted(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed';
      const mapped = mapRegisterApiError(message);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError ?? null);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <RegisterSuccessView submitted={submitted} />;
  }

  return (
    <RegisterForm
      companyName={companyName}
      firstName={firstName}
      lastName={lastName}
      email={email}
      password={password}
      loading={loading}
      fieldErrors={fieldErrors}
      formError={formError}
      onCompanyNameChange={(value) => {
        setCompanyName(value);
        clearErrors();
      }}
      onFirstNameChange={(value) => {
        setFirstName(value);
        clearErrors();
      }}
      onLastNameChange={(value) => {
        setLastName(value);
        clearErrors();
      }}
      onEmailChange={(value) => {
        setEmail(value);
        clearErrors();
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        clearErrors();
      }}
      onSubmit={handleSubmit}
    />
  );
};
