import type { ThemeColor } from '../types';
import { applyBrandShades, generateBrandShades } from './theme';

export const THEME_PRIMARY: Record<ThemeColor, string> = {
  purple: '#5746AF',
  blue: '#0B68CB',
  pink: '#B64F79',
  green: '#5CA177',
  orange: '#E1983D',
};

export interface ThemeColorDefinition {
  label: string;
  swatch: string;
  banner: string;
  brand: ReturnType<typeof generateBrandShades>;
}

export const THEME_COLOR_OPTIONS: ThemeColor[] = ['purple', 'blue', 'pink', 'green', 'orange'];

const buildThemeColor = (
  label: string,
  primary: string,
  banner: string
): ThemeColorDefinition => ({
  label,
  swatch: primary,
  banner,
  brand: generateBrandShades(primary),
});

export const THEME_COLORS: Record<ThemeColor, ThemeColorDefinition> = {
  purple: buildThemeColor('Purple', THEME_PRIMARY.purple, '/banners/bg-banner-purple.png'),
  blue: buildThemeColor('Blue', THEME_PRIMARY.blue, '/banners/bg-banner-blue.png'),
  pink: buildThemeColor('Pink', THEME_PRIMARY.pink, '/banners/bg-banner-pink.png'),
  green: buildThemeColor('Green', THEME_PRIMARY.green, '/banners/bg-banner-green.jpg'),
  orange: buildThemeColor('Orange', THEME_PRIMARY.orange, '/banners/bg-banner-orange.png'),
};

export const DEFAULT_THEME_COLOR: ThemeColor = 'green';

export const resolveThemeColor = (value?: ThemeColor | null): ThemeColor => {
  if (value && value in THEME_COLORS) {
    return value;
  }
  return DEFAULT_THEME_COLOR;
};

export const applyThemeColor = (themeColor: ThemeColor): void => {
  applyBrandShades(THEME_PRIMARY[resolveThemeColor(themeColor)]);
};

export const themeBannerUrl = (themeColor: ThemeColor): string =>
  THEME_COLORS[resolveThemeColor(themeColor)].banner;
