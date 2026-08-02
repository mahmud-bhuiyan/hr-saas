import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { bootstrapSession } from '../lib/api';
import {
  clearAuthState,
  loadAuth,
  setAuthState,
  setUserState,
  subscribeAuth,
} from '../lib/auth-storage';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState(loadAuth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return subscribeAuth(() => setAuth(loadAuth()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    bootstrapSession().finally(() => {
      if (!cancelled) {
        setAuth(loadAuth());
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setAuthUser = useCallback((user: AuthUser, accessToken: string) => {
    setAuthState(user, accessToken);
  }, []);

  const setUser = useCallback((user: AuthUser) => {
    setUserState(user);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthState();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth.user,
      accessToken: auth.accessToken,
      isReady,
      isAuthenticated: Boolean(auth.accessToken && auth.user),
      setAuth: setAuthUser,
      setUser,
      clearAuth,
    }),
    [auth.accessToken, auth.user, isReady, setAuthUser, setUser, clearAuth]
  );

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
