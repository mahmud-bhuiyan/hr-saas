import type { FaviconDisplaySettings } from '../types';
import { resolveDocumentFaviconUrl } from './favicon';

export interface BrandShades {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mix = (base: { r: number; g: number; b: number }, target: { r: number; g: number; b: number }, weight: number) => ({
  r: Math.round(base.r + (target.r - base.r) * weight),
  g: Math.round(base.g + (target.g - base.g) * weight),
  b: Math.round(base.b + (target.b - base.b) * weight),
});

export const generateBrandShades = (primaryHex: string): BrandShades => {
  const primary = hexToRgb(primaryHex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const shade50 = mix(primary, white, 0.92);
  const shade100 = mix(primary, white, 0.84);
  const shade500 = mix(primary, white, 0.25);
  const shade700 = mix(primary, black, 0.18);

  return {
    50: rgbToHex(shade50.r, shade50.g, shade50.b),
    100: rgbToHex(shade100.r, shade100.g, shade100.b),
    500: rgbToHex(shade500.r, shade500.g, shade500.b),
    600: primaryHex,
    700: rgbToHex(shade700.r, shade700.g, shade700.b),
  };
};

export const applyBrandShades = (primaryHex: string): void => {
  const shades = generateBrandShades(primaryHex);
  const root = document.documentElement;

  root.style.setProperty('--brand-50', shades[50]);
  root.style.setProperty('--brand-100', shades[100]);
  root.style.setProperty('--brand-500', shades[500]);
  root.style.setProperty('--brand-600', shades[600]);
  root.style.setProperty('--brand-700', shades[700]);
};

export const applyDocumentBranding = async (
  siteName: string,
  faviconUrl: string | null,
  _faviconDisplay?: FaviconDisplaySettings
): Promise<void> => {
  document.title = siteName;

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  const styledFaviconUrl = await resolveDocumentFaviconUrl(faviconUrl, siteName);
  link.href = styledFaviconUrl;
  link.type = 'image/png';
};
