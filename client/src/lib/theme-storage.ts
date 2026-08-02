import { loadAuth } from './auth-storage';
import type { ColorScheme } from '../types';

export type { ColorScheme };

const THEME_STORAGE_KEY = 'hr-saas-theme';

interface ThemePreferences {
  byUser: Record<string, ColorScheme>;
  guest: ColorScheme;
}

const defaultPreferences = (): ThemePreferences => ({
  byUser: {},
  guest: 'light',
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
      guest: parsed.guest ?? 'light',
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

export const resolveColorScheme = (
  userId: string | null | undefined,
  serverColorScheme?: ColorScheme
): ColorScheme => {
  if (userId && serverColorScheme) {
    return serverColorScheme;
  }

  return loadColorSchemeForUser(userId);
};

export const initColorSchemeFromStorage = (): void => {
  const { user } = loadAuth();
  applyColorScheme(resolveColorScheme(user?.id, user?.colorScheme));
};
