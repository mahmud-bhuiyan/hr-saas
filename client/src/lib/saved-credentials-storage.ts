const SAVED_CREDENTIALS_KEY = 'hr-saas-saved-credentials';
const TTL_MS = 6 * 60 * 60 * 1000;

interface SavedCredentials {
  email: string;
  password: string;
  expiresAt: number;
}

export interface LoadedCredentials {
  email: string;
  password: string;
}

export const loadSavedCredentials = (): LoadedCredentials | null => {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SavedCredentials;
    if (Date.now() >= parsed.expiresAt) {
      clearSavedCredentials();
      return null;
    }

    return { email: parsed.email, password: parsed.password };
  } catch {
    clearSavedCredentials();
    return null;
  }
}

export const saveSavedCredentials = (email: string, password: string): void => {
  const payload: SavedCredentials = {
    email,
    password,
    expiresAt: Date.now() + TTL_MS,
  };
  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(payload));
}

export const clearSavedCredentials = (): void => {
  localStorage.removeItem(SAVED_CREDENTIALS_KEY);
}
