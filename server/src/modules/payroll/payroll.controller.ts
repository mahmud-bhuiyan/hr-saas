import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  PayrollServiceError,
  createPayrollPeriod,
  exportPayrollPeriodCsv,
  generatePayrollPeriod,
  getPayrollPeriod,
  listPayrollPeriods,
} from './payroll.service.js';
import { createPayrollPeriodSchema } from './payroll.validation.js';

const getAuditContext = (req: AuthenticatedRequest) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') ?? undefined,
});

export const listPayrollPeriodsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const periods = await listPayrollPeriods(req.tenantId);
    res.json({ status: 'ok', data: periods });
  } catch (error) {
    if (error instanceof PayrollServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getPayrollPeriodHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const period = await getPayrollPeriod(req.tenantId, req.params.id);
    res.json({ status: 'ok', data: period });
  } catch (error) {
    if (error instanceof PayrollServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createPayrollPeriodHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = createPayrollPeriodSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const period = await createPayrollPeriod(
      req.tenantId,
      parsed.data,
      req.user.sub,
      getAuditContext(req)
    );
    res.status(201).json({ status: 'ok', data: period });
  } catch (error) {
    if (error instanceof PayrollServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const generatePayrollPeriodHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const period = await generatePayrollPeriod(
      req.tenantId,
      req.params.id,
      req.user.sub,
      getAuditContext(req)
    );
    res.json({ status: 'ok', data: period });
  } catch (error) {
    if (error instanceof PayrollServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const exportPayrollPeriodHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const { csv, filename } = await exportPayrollPeriodCsv(
      req.tenantId,
      req.params.id,
      req.user.sub,
      getAuditContext(req)
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    if (error instanceof PayrollServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
