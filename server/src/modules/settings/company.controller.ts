import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  CompanySettingsServiceError,
  getCompanyProfile,
  patchCompanyProfile,
} from './company.service.js';
import { patchCompanyProfileSchema } from './company.validation.js';

export const getCompanyProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const profile = await getCompanyProfile(req.tenantId);
    res.json({ status: 'ok', data: profile });
  } catch (error) {
    if (error instanceof CompanySettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchCompanyProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = patchCompanyProfileSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const profile = await patchCompanyProfile(req.tenantId, parsed.data, req.user.sub);
    res.json({ status: 'ok', data: profile });
  } catch (error) {
    if (error instanceof CompanySettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
