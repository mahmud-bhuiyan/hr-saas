import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  PayrollSettingsServiceError,
  getPayrollSettings,
  patchPayrollSettings,
} from './payroll-settings.service.js';
import { patchPayrollSettingsSchema } from './payroll-settings.validation.js';

export const getPayrollSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await getPayrollSettings(req.tenantId!);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    if (error instanceof PayrollSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchPayrollSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = patchPayrollSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const settings = await patchPayrollSettings(req.tenantId!, parsed.data, req.user!.sub);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    if (error instanceof PayrollSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
