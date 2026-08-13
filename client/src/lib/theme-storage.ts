import { loadAuth } from './auth-storage';
import type { ColorScheme, ThemeColor } from '../types';
import {
  applyThemeColor,
  DEFAULT_THEME_COLOR,
  resolveThemeColor,
} from '../utils/theme-colors';

export type { ColorScheme };

const THEME_STORAGE_KEY = 'hr-saas-theme';

interface ThemePreferences {
  byUser: Record<string, ColorScheme>;
  themeColorByUser: Record<string, ThemeColor>;
  guest: ColorScheme;
  guestThemeColor: ThemeColor;
}

const defaultPreferences = (): ThemePreferences => ({
  byUser: {},
  themeColorByUser: {},
  guest: 'light',
  guestThemeColor: DEFAULT_THEME_COLOR,
});

const readPreferences = (): ThemePreferences => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return defaultPreferences();
    }

    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    return {
      byUser: parsed.byUser ?? {},
      themeColorByUser: parsed.themeColorByUser ?? {},
      guest: parsed.guest ?? 'light',
      guestThemeColor: parsed.guestThemeColor ?? DEFAULT_THEME_COLOR,
    };
  } catch {
    return defaultPreferences();
  }
};

const writePreferences = (preferences: ThemePreferences): void => {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
};

export const applyColorScheme = (scheme: ColorScheme): void => {
  document.documentElement.classList.toggle('dark', scheme === 'dark');
};

export const loadColorSchemeForUser = (userId: string | null | undefined): ColorScheme => {
  const preferences = readPreferences();

  if (userId && preferences.byUser[userId]) {
    return preferences.byUser[userId];
  }

  return preferences.guest;
};

export const saveColorSchemeForUser = (
  userId: string | null | undefined,
  scheme: ColorScheme
): void => {
  const preferences = readPreferences();

  if (userId) {
    preferences.byUser[userId] = scheme;
  } else {
    preferences.guest = scheme;
  }

  writePreferences(preferences);
};

export const loadThemeColorForUser = (userId: string | null | undefined): ThemeColor => {
  const preferences = readPreferences();

  if (userId && preferences.themeColorByUser[userId]) {
    return resolveThemeColor(preferences.themeColorByUser[userId]);
  }

  return resolveThemeColor(preferences.guestThemeColor);
};

export const saveThemeColorForUser = (
  userId: string | null | undefined,
  themeColor: ThemeColor
): void => {
  const preferences = readPreferences();
  const resolved = resolveThemeColor(themeColor);

  if (userId) {
    preferences.themeColorByUser[userId] = resolved;
  } else {
    preferences.guestThemeColor = resolved;
  }

  writePreferences(preferences);
};

export const resolveColorScheme = (
  userId: string | null | undefined,
  serverColorScheme?: ColorScheme
): ColorScheme => {
  if (userId && serverColorScheme) {
    return serverColorScheme;
  }

  return loadColorSchemeForUser(userId);
};

export const resolveUserThemeColor = (
  userId: string | null | undefined,
  serverThemeColor?: ThemeColor
): ThemeColor => {
  if (userId && serverThemeColor) {
    return resolveThemeColor(serverThemeColor);
  }

  return loadThemeColorForUser(userId);
};

export const initColorSchemeFromStorage = (): void => {
  const { user } = loadAuth();
  applyColorScheme(resolveColorScheme(user?.id, user?.colorScheme));
  applyThemeColor(resolveUserThemeColor(user?.id, user?.themeColor));
};

export { applyThemeColor };
