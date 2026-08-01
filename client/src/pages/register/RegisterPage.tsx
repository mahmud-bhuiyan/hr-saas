import { FormEvent, useState } from 'react';
import { ApiError, register } from '../../lib/api';
import { toast } from 'react-toastify';
import type { RegisterPendingResponse } from '../../types';
import { areRequiredFieldsFilled } from '../../utils/form';
import { RegisterForm, RegisterSuccessView } from './components/RegisterForm';

export const RegisterPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<RegisterPendingResponse | null>(null);

  const canSubmit =
    areRequiredFieldsFilled({ companyName, email, password }, ['companyName', 'email', 'password']) &&
    password.length >= 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      toast.error(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

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
      canSubmit={canSubmit}
      onCompanyNameChange={setCompanyName}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}
