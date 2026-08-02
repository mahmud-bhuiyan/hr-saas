import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  TimesheetServiceError,
  approveTimesheet,
  declineTimesheet,
  generateTimesheet,
  getMyTimesheetForWeek,
  listMyTimesheets,
  listTimesheets,
  mapTimesheetError,
  patchTimesheet,
  submitTimesheet,
} from './timesheet.service.js';
import {
  declineTimesheetSchema,
  generateTimesheetSchema,
  listMyTimesheetsQuerySchema,
  listTimesheetsQuerySchema,
  patchTimesheetSchema,
} from './timesheet.validation.js';

const accessContext = (req: AuthenticatedRequest) => ({
  userId: req.user!.sub,
  userEmail: req.user!.email,
  role: req.user!.role,
});

const auditContext = (req: AuthenticatedRequest) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') ?? undefined,
});

const handleError = (res: Response, error: unknown): void => {
  const mapped = mapTimesheetError(error);
  if (mapped instanceof TimesheetServiceError) {
    res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
    return;
  }
  throw error;
};

export const generateTimesheetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = generateTimesheetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const timesheet = await generateTimesheet(
        req.tenantId!,
        parsed.data,
        accessContext(req),
        auditContext(req)
      );
      res.status(201).json({ status: 'ok', data: timesheet });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const listMyTimesheetsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listMyTimesheetsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const result = await listMyTimesheets(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getMyTimesheetForWeekHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const timesheet = await getMyTimesheetForWeek(
      req.tenantId!,
      req.params.weekOf!,
      accessContext(req)
    );
    res.json({ status: 'ok', data: timesheet });
  } catch (error) {
    handleError(res, error);
  }
};

export const listTimesheetsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listTimesheetsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const result = await listTimesheets(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const patchTimesheetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = patchTimesheetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const timesheet = await patchTimesheet(
        req.tenantId!,
        req.params.id!,
        parsed.data,
        accessContext(req),
        auditContext(req)
      );
      res.json({ status: 'ok', data: timesheet });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const submitTimesheetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const timesheet = await submitTimesheet(
        req.tenantId!,
        req.params.id!,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: timesheet });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const approveTimesheetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const timesheet = await approveTimesheet(
        req.tenantId!,
        req.params.id!,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: timesheet });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const declineTimesheetHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = declineTimesheetSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const timesheet = await declineTimesheet(
        req.tenantId!,
        req.params.id!,
        parsed.data.declineReason,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: timesheet });
    } catch (error) {
      handleError(res, error);
    }
  };
};
