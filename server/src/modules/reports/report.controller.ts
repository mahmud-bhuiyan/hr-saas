import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  ReportServiceError,
  getAbsenceSummaryReport,
  getHeadcountReport,
} from './report.service.js';
import { absenceSummaryQuerySchema, headcountQuerySchema } from './report.validation.js';

export const headcountReportHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = headcountQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const report = await getHeadcountReport(req.tenantId!, parsed.data);
    res.json({ status: 'ok', data: report });
  } catch (error) {
    if (error instanceof ReportServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const absenceSummaryReportHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = absenceSummaryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const report = await getAbsenceSummaryReport(req.tenantId!, parsed.data);
    res.json({ status: 'ok', data: report });
  } catch (error) {
    if (error instanceof ReportServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
