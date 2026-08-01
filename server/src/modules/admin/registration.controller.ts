import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  RegistrationServiceError,
  approveRegistration,
  listRegistrationRequests,
  rejectRegistration,
} from './registration.service.js';
import { rejectRegistrationSchema } from './registration.validation.js';
import type { TenantApprovalStatus } from '../auth/tenant.model.js';

export async function listRegistrationsHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const status = req.query.status as TenantApprovalStatus | undefined;
    const registrations = await listRegistrationRequests(status);
    res.json({ status: 'ok', data: { registrations } });
  } catch {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export async function approveRegistrationHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const registration = await approveRegistration(req.params.tenantId!, req.user.sub);
    res.json({ status: 'ok', data: registration });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export async function rejectRegistrationHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const parsed = rejectRegistrationSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const registration = await rejectRegistration(
      req.params.tenantId!,
      parsed.data.reason
    );
    res.json({ status: 'ok', data: registration });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
