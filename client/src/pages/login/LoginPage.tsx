import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError, login } from "../../lib/api";
import { homePathForRole } from "../../utils/routes";
import { ADMIN_DASHBOARD_PATH } from "../../pages/admin/utils";
import {
  clearSavedCredentials,
  loadSavedCredentials,
  saveSavedCredentials,
} from "../../lib/saved-credentials-storage";
import { LoginForm } from "./components/LoginForm";

const mapLoginApiError = (
  message: string,
): { passwordError?: string; formError?: string } => {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid email") ||
    lower === "invalid email or password"
  ) {
    return { passwordError: message };
  }

  if (lower.includes("email")) {
    return { formError: message };
  }

  return { formError: message };
};

const getInitialLoginState = () => {
  const saved = loadSavedCredentials();

  if (saved) {
    return {
      email: saved.email,
      password: saved.password,
      saveForLater: true,
      initialStep: 2 as const,
    };
  }

  return {
    email: "",
    password: "",
    saveForLater: false,
    initialStep: 1 as const,
  };
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  const [loginState] = useState(getInitialLoginState);
  const [email, setEmail] = useState(loginState.email);
  const [password, setPassword] = useState(loginState.password);
  const [saveForLater, setSaveForLater] = useState(loginState.saveForLater);
  const [step, setStep] = useState<1 | 2>(loginState.initialStep);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? ADMIN_DASHBOARD_PATH;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFormError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
    setFormError(null);
  };

  const handleEmailContinue = () => {
    setFormError(null);
    setStep(2);
  };

  const handleBackToEmail = () => {
    setStep(1);
    setPasswordError(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError(null);
    setFormError(null);

    try {
      const data = await login({ email, password });

      if (saveForLater) {
        saveSavedCredentials(email, password);
      } else {
        clearSavedCredentials();
      }

      setAuth(data.user, data.accessToken);
      const destination =
        from === ADMIN_DASHBOARD_PATH ? homePathForRole(data.user.role) : from;
      navigate(destination, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      const mapped = mapLoginApiError(message);
      setPasswordError(mapped.passwordError ?? null);
      setFormError(mapped.formError ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      email={email}
      password={password}
      saveForLater={saveForLater}
      loading={loading}
      step={step}
      passwordError={passwordError}
      formError={formError}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSaveForLaterChange={setSaveForLater}
      onEmailContinue={handleEmailContinue}
      onBackToEmail={handleBackToEmail}
      onSubmit={handleSubmit}
    />
  );
};
