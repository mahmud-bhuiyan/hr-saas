import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import {
  DEFAULT_FAVICON_DISPLAY,
  DEFAULT_LOGO_DISPLAY,
  DEFAULT_PLATFORM_SETTINGS,
  PLATFORM_SETTINGS_KEY,
  type FaviconDisplaySettings,
  type LogoDisplaySettings,
  type PlatformSiteSettings,
  type SiteConfig,
  type EffectiveBranding,
  type TenantBrandingOverrides,
} from '../../constants/platform-settings.js';
import { Tenant, type ITenantDocument } from '../auth/tenant.model.js';
import { uploadPlatformAssetToImgbb } from './imgbb.service.js';
import { PlatformSettings } from './platform-settings.model.js';
import type {
  PatchPlatformSettingsInput,
  PatchTenantBrandingInput,
  UploadPlatformAssetInput,
} from './platform-settings.validation.js';
import { stripDataUrlPrefix } from './platform-settings.validation.js';

export class PlatformSettingsServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'PlatformSettingsServiceError';
  }
}

const normalizeUrl = (value: string | null | undefined): string | null => {
  if (value === null || value === '' || value === undefined) {
    return null;
  }
  return value;
};

const mergeLogoDisplay = (
  current?: Partial<LogoDisplaySettings> | null
): LogoDisplaySettings => ({
  heightPx: current?.heightPx ?? DEFAULT_LOGO_DISPLAY.heightPx,
  maxWidthPx: current?.maxWidthPx ?? DEFAULT_LOGO_DISPLAY.maxWidthPx,
  objectFit: current?.objectFit ?? DEFAULT_LOGO_DISPLAY.objectFit,
  showSiteName: current?.showSiteName ?? DEFAULT_LOGO_DISPLAY.showSiteName,
});

const mergeFaviconDisplay = (
  current?: Partial<FaviconDisplaySettings> | null
): FaviconDisplaySettings => ({
  mimeType: current?.mimeType ?? DEFAULT_FAVICON_DISPLAY.mimeType,
});

const toSiteConfig = (doc: {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  logoDisplay?: Partial<LogoDisplaySettings> | null;
  faviconDisplay?: Partial<FaviconDisplaySettings> | null;
}): SiteConfig => ({
  siteName: doc.siteName,
  logoUrl: doc.logoUrl ?? null,
  faviconUrl: doc.faviconUrl ?? null,
  primaryColor: doc.primaryColor,
  logoDisplay: mergeLogoDisplay(doc.logoDisplay),
  faviconDisplay: mergeFaviconDisplay(doc.faviconDisplay),
});

const getPlatformDocument = async () =>
  PlatformSettings.findOne({ key: PLATFORM_SETTINGS_KEY }).lean();

export const getPlatformSiteConfig = async (): Promise<SiteConfig> => {
  const doc = await getPlatformDocument();
  if (!doc) {
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      logoDisplay: { ...DEFAULT_LOGO_DISPLAY },
      faviconDisplay: { ...DEFAULT_FAVICON_DISPLAY },
    };
  }
  return toSiteConfig(doc);
};

export const getPlatformSiteSettings = async (): Promise<PlatformSiteSettings> => {
  const doc = await getPlatformDocument();
  if (!doc) {
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      logoDisplay: { ...DEFAULT_LOGO_DISPLAY },
      faviconDisplay: { ...DEFAULT_FAVICON_DISPLAY },
    };
  }

  return {
    ...toSiteConfig(doc),
    updatedAt: doc.updatedAt?.toISOString(),
    updatedBy: doc.updatedBy?.toString(),
  };
};

export const patchPlatformSiteSettings = async (
  input: PatchPlatformSettingsInput,
  userId: string
): Promise<PlatformSiteSettings> => {
  const current = await getPlatformSiteConfig();

  const nextLogoDisplay = mergeLogoDisplay({
    ...current.logoDisplay,
    ...(input.logoDisplay ?? {}),
  });

  const nextFaviconDisplay = mergeFaviconDisplay({
    ...current.faviconDisplay,
    ...(input.faviconDisplay ?? {}),
  });

  const next: SiteConfig = {
    siteName: input.siteName ?? current.siteName,
    logoUrl: input.logoUrl !== undefined ? normalizeUrl(input.logoUrl) : current.logoUrl,
    faviconUrl: input.faviconUrl !== undefined ? normalizeUrl(input.faviconUrl) : current.faviconUrl,
    primaryColor: input.primaryColor ?? current.primaryColor,
    logoDisplay: nextLogoDisplay,
    faviconDisplay: nextFaviconDisplay,
  };

  const doc = await PlatformSettings.findOneAndUpdate(
    { key: PLATFORM_SETTINGS_KEY },
    {
      $set: {
        ...next,
        key: PLATFORM_SETTINGS_KEY,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  if (!doc) {
    throw new PlatformSettingsServiceError('Failed to update platform settings', 500);
  }

  return {
    ...toSiteConfig(doc),
    updatedAt: doc.updatedAt?.toISOString(),
    updatedBy: doc.updatedBy?.toString(),
  };
};

export const uploadPlatformAsset = async (
  env: ServerEnv,
  input: UploadPlatformAssetInput
): Promise<{ url: string; asset: 'logo' | 'favicon' }> => {
  const base64 = stripDataUrlPrefix(input.imageBase64.trim());
  const url = await uploadPlatformAssetToImgbb(env, input.asset, base64, input.filename);
  return { url, asset: input.asset };
};

const getTenantBrandingOverrides = (tenant: ITenantDocument): TenantBrandingOverrides => ({
  logoUrl: tenant.branding?.logoUrl ?? null,
  primaryColor: tenant.branding?.primaryColor ?? null,
});

export const mergeBranding = (
  platform: SiteConfig,
  overrides: TenantBrandingOverrides
): SiteConfig => ({
  ...platform,
  logoUrl: overrides.logoUrl ?? platform.logoUrl,
  primaryColor: overrides.primaryColor ?? platform.primaryColor,
});

export const getEffectiveBranding = async (tenantId?: string): Promise<EffectiveBranding> => {
  const platform = await getPlatformSiteConfig();

  if (!tenantId) {
    return platform;
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new PlatformSettingsServiceError('Tenant not found', 404);
  }

  return {
    ...mergeBranding(platform, getTenantBrandingOverrides(tenant)),
    tenantDisplayName: tenant.name,
  };
};

export const getTenantBrandingSettings = async (
  tenantId: string
): Promise<TenantBrandingOverrides> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new PlatformSettingsServiceError('Tenant not found', 404);
  }
  return getTenantBrandingOverrides(tenant);
};

export const patchTenantBranding = async (
  tenantId: string,
  input: PatchTenantBrandingInput,
  userId: string
): Promise<EffectiveBranding> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new PlatformSettingsServiceError('Tenant not found', 404);
  }

  if (!tenant.branding) {
    tenant.branding = { logoUrl: null, primaryColor: null };
  }

  if (input.logoUrl !== undefined) {
    tenant.branding.logoUrl = normalizeUrl(input.logoUrl);
  }
  if (input.primaryColor !== undefined) {
    tenant.branding.primaryColor = input.primaryColor;
  }

  tenant.updatedBy = new mongoose.Types.ObjectId(userId);
  await tenant.save();

  return getEffectiveBranding(tenantId);
};
