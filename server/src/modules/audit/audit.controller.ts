import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { AuditServiceError, listAuditLogs } from './audit.service.js';
import { listAuditLogsQuerySchema } from './audit.validation.js';

export const listAuditLogsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listAuditLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const result = await listAuditLogs(req.tenantId!, parsed.data);

    res.json({ status: 'ok', data: result });
  } catch (error) {
    if (error instanceof AuditServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
