import type { AuthUser } from '../types';

const AUTH_STORAGE_KEY = 'hr-saas-auth';

interface StoredAuth {
  accessToken: string | null;
  user: AuthUser | null;
}

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadAuth(): StoredAuth {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { accessToken: null, user: null };
    }
    const parsed = JSON.parse(raw) as StoredAuth & { state?: StoredAuth };

    if (parsed.state) {
      return {
        accessToken: parsed.state.accessToken ?? null,
        user: parsed.state.user ?? null,
      };
    }

    return {
      accessToken: parsed.accessToken ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return { accessToken: null, user: null };
  }
}

export function saveAuth(accessToken: string | null, user: AuthUser | null): void {
  if (!accessToken && !user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, user }));
  }
  notifyListeners();
}

export function getAccessToken(): string | null {
  return loadAuth().accessToken;
}

export function setAuthState(user: AuthUser, accessToken: string): void {
  saveAuth(accessToken, user);
}

export function setUserState(user: AuthUser): void {
  const { accessToken } = loadAuth();
  saveAuth(accessToken, user);
}

export function clearAuthState(): void {
  saveAuth(null, null);
}
