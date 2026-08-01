import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { ImgbbServiceError } from './imgbb.service.js';
import {
  PlatformSettingsServiceError,
  getEffectiveBranding,
  getPlatformSiteConfig,
  getPlatformSiteSettings,
  getTenantBrandingSettings,
  patchPlatformSiteSettings,
  patchTenantBranding,
  uploadPlatformAsset,
} from './platform-settings.service.js';
import {
  patchPlatformSettingsSchema,
  patchTenantBrandingSchema,
  uploadPlatformAssetSchema,
} from './platform-settings.validation.js';

export const getSiteConfigHandler = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const config = await getPlatformSiteConfig();
    res.json({ status: 'ok', data: config });
  } catch {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getPlatformSiteSettingsHandler = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await getPlatformSiteSettings();
    res.json({ status: 'ok', data: settings });
  } catch {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchPlatformSiteSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const parsed = patchPlatformSettingsSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const settings = await patchPlatformSiteSettings(parsed.data, req.user.sub);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    if (error instanceof PlatformSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const uploadPlatformAssetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return;
      }

      const parsed = uploadPlatformAssetSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const result = await uploadPlatformAsset(env, parsed.data);
      res.json({ status: 'ok', data: result });
    } catch (error) {
      if (error instanceof ImgbbServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      if (error instanceof PlatformSettingsServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const getEffectiveBrandingHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const tenantId = req.user.role === 'super_admin' ? undefined : req.tenantId;
    const branding = await getEffectiveBranding(tenantId);
    res.json({ status: 'ok', data: branding });
  } catch (error) {
    if (error instanceof PlatformSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getTenantBrandingSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const overrides = await getTenantBrandingSettings(req.tenantId);
    res.json({ status: 'ok', data: overrides });
  } catch (error) {
    if (error instanceof PlatformSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchTenantBrandingHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = patchTenantBrandingSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const branding = await patchTenantBranding(req.tenantId, parsed.data, req.user.sub);
    res.json({ status: 'ok', data: branding });
  } catch (error) {
    if (error instanceof PlatformSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
