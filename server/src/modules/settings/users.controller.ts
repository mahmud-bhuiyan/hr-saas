import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type { AuditContext } from '../audit/audit.service.js';
import {
  TenantUsersServiceError,
  listTenantUsers,
  patchTenantUser,
} from './users.service.js';
import { patchTenantUserSchema } from './users.validation.js';

const auditContext = (req: AuthenticatedRequest): AuditContext => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

export const listTenantUsersHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const users = await listTenantUsers(req.tenantId);
    res.json({ status: 'ok', data: { users } });
  } catch (error) {
    if (error instanceof TenantUsersServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchTenantUserHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = patchTenantUserSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const user = await patchTenantUser(
      req.tenantId,
      req.params.id,
      parsed.data,
      req.user.sub,
      auditContext(req)
    );
    res.json({ status: 'ok', data: user });
  } catch (error) {
    if (error instanceof TenantUsersServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
