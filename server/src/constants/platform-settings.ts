export const PLATFORM_SETTINGS_KEY = 'default';

export type LogoObjectFit = 'contain' | 'cover';

export type LogoShape = 'default' | 'circle';

export type FaviconMimeType =
  | 'auto'
  | 'image/png'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'image/webp';

export interface LogoDisplaySettings {
  heightPx: number;
  maxWidthPx: number;
  objectFit: LogoObjectFit;
  shape: LogoShape;
  showSiteName: boolean;
}

export interface FaviconDisplaySettings {
  mimeType: FaviconMimeType;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  logoDisplay: LogoDisplaySettings;
  faviconDisplay: FaviconDisplaySettings;
}

export interface PlatformSiteSettings extends SiteConfig {
  updatedAt?: string;
  updatedBy?: string;
}

export interface EffectiveBranding extends SiteConfig {
  tenantDisplayName?: string;
}

export interface TenantBrandingOverrides {
  logoUrl: string | null;
  primaryColor: string | null;
}

export const DEFAULT_LOGO_DISPLAY: LogoDisplaySettings = {
  heightPx: 32,
  maxWidthPx: 160,
  objectFit: 'contain',
  shape: 'circle',
  showSiteName: false,
};

export const DEFAULT_FAVICON_DISPLAY: FaviconDisplaySettings = {
  mimeType: 'auto',
};

export const DEFAULT_PLATFORM_SETTINGS: SiteConfig = {
  siteName: 'Daily HR',
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#2563eb',
  logoDisplay: { ...DEFAULT_LOGO_DISPLAY },
  faviconDisplay: { ...DEFAULT_FAVICON_DISPLAY },
};
