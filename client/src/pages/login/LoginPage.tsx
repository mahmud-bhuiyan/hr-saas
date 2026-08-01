import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, login } from '../../lib/api';
import { toast } from 'react-toastify';
import {
  clearSavedCredentials,
  loadSavedCredentials,
  saveSavedCredentials,
} from '../../lib/saved-credentials-storage';
import { areRequiredFieldsFilled } from '../../utils/form';
import { LoginForm } from './components/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveForLater, setSaveForLater] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  useEffect(() => {
    const saved = loadSavedCredentials();
    if (saved) {
      setEmail(saved.email);
      setPassword(saved.password);
      setSaveForLater(true);
    }
  }, []);

  const canSubmit = areRequiredFieldsFilled({ email, password }, ['email', 'password']);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ email, password });

      if (saveForLater) {
        saveSavedCredentials(email, password);
      } else {
        clearSavedCredentials();
      }

      setAuth(data.user, data.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginForm
      email={email}
      password={password}
      saveForLater={saveForLater}
      loading={loading}
      canSubmit={canSubmit}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSaveForLaterChange={setSaveForLater}
      onSubmit={handleSubmit}
    />
  );
}
