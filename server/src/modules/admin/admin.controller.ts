import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  AdminServiceError,
  countUsers,
  createAdmin,
} from './admin.service.js';
import { createAdminSchema } from './admin.validation.js';

export const createAdminHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const userCount = await countUsers();
    const isBootstrap = userCount === 0;

    if (!isBootstrap) {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return;
      }

      if (req.user.role !== 'super_admin') {
        res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
        return;
      }
    } else if (parsed.data.role !== 'super_admin') {
      res.status(403).json({
        status: 'error',
        message: 'Bootstrap admin must be super_admin',
      });
      return;
    }

    const admin = await createAdmin(parsed.data);

    res.status(201).json({ status: 'ok', data: admin });
  } catch (error) {
    if (error instanceof AdminServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
