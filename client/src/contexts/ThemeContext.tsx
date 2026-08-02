import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { updateColorScheme, updateThemeColor } from '../lib/api';
import { loadAuth, setUserState, subscribeAuth } from '../lib/auth-storage';
import {
  applyColorScheme,
  applyThemeColor,
  loadColorSchemeForUser,
  loadThemeColorForUser,
  resolveColorScheme,
  resolveUserThemeColor,
  saveColorSchemeForUser,
  saveThemeColorForUser,
  type ColorScheme,
} from '../lib/theme-storage';
import type { ThemeColor } from '../types';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  themeColor: ThemeColor;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemeColor: (themeColor: ThemeColor) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readAuthSnapshot = () => loadAuth();

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [authSnapshot, setAuthSnapshot] = useState(readAuthSnapshot);

  const userId = authSnapshot.user?.id ?? null;
  const serverColorScheme = authSnapshot.user?.colorScheme;
  const serverThemeColor = authSnapshot.user?.themeColor;

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() =>
    resolveColorScheme(readAuthSnapshot().user?.id, readAuthSnapshot().user?.colorScheme)
  );

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() =>
    resolveUserThemeColor(readAuthSnapshot().user?.id, readAuthSnapshot().user?.themeColor)
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
      applyThemeColor(themeColor);
    }
  }, [themeColor, userId]);

  useEffect(() => {
    if (userId) {
      const scheme = resolveColorScheme(userId, serverColorScheme);
      setColorSchemeState(scheme);
      saveColorSchemeForUser(userId, scheme);

      const color = resolveUserThemeColor(userId, serverThemeColor);
      setThemeColorState(color);
      saveThemeColorForUser(userId, color);
      return;
    }

    setColorSchemeState(loadColorSchemeForUser(null));
    setThemeColorState(loadThemeColorForUser(null));
  }, [userId, serverColorScheme, serverThemeColor]);

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

  const setThemeColor = useCallback(
    (color: ThemeColor) => {
      setThemeColorState(color);
      saveThemeColorForUser(userId, color);

      const { user } = loadAuth();
      if (user) {
        setUserState({ ...user, themeColor: color });
      }

      if (userId) {
        void updateThemeColor(color).catch(() => {
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
      themeColor,
      setColorScheme,
      setThemeColor,
      toggleColorScheme,
    }),
    [colorScheme, themeColor, setColorScheme, setThemeColor, toggleColorScheme]
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
