import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { updateColorScheme } from '../lib/api';
import { loadAuth, setUserState, subscribeAuth } from '../lib/auth-storage';
import {
  applyColorScheme,
  loadColorSchemeForUser,
  resolveColorScheme,
  saveColorSchemeForUser,
  type ColorScheme,
} from '../lib/theme-storage';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readAuthSnapshot = () => loadAuth();

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [authSnapshot, setAuthSnapshot] = useState(readAuthSnapshot);

  const userId = authSnapshot.user?.id ?? null;
  const serverColorScheme = authSnapshot.user?.colorScheme;

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() =>
    resolveColorScheme(readAuthSnapshot().user?.id, readAuthSnapshot().user?.colorScheme)
  );

  useEffect(() => {
    return subscribeAuth(() => {
      setAuthSnapshot(readAuthSnapshot());
    });
  }, []);

  useEffect(() => {
    applyColorScheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    if (userId) {
      const scheme = resolveColorScheme(userId, serverColorScheme);
      setColorSchemeState(scheme);
      saveColorSchemeForUser(userId, scheme);
      return;
    }

    setColorSchemeState(loadColorSchemeForUser(null));
  }, [userId, serverColorScheme]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      saveColorSchemeForUser(userId, scheme);

      const { user } = loadAuth();
      if (user) {
        setUserState({ ...user, colorScheme: scheme });
      }

      if (userId) {
        void updateColorScheme(scheme).catch(() => {
          // Keep local preference; server sync can retry on next login.
        });
      }
    },
    [userId]
  );

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
