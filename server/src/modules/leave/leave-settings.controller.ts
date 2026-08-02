import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  LeaveSettingsServiceError,
  getLeaveSettings,
  patchLeaveSettings,
} from './leave-settings.service.js';
import { patchLeaveSettingsSchema } from './leave-settings.validation.js';

export const getLeaveSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await getLeaveSettings(req.tenantId!);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    if (error instanceof LeaveSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchLeaveSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = patchLeaveSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const settings = await patchLeaveSettings(req.tenantId!, parsed.data, req.user!.sub);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    if (error instanceof LeaveSettingsServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
