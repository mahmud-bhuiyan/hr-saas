import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  AttendanceServiceError,
  clockIn,
  clockOut,
  getAttendanceSettings,
  getMyAttendanceStatus,
  listEmployeeAttendance,
  listMyAttendance,
  listTeamLive,
  mapAttendanceError,
  patchAttendanceLog,
  patchAttendanceSettings,
} from './attendance.service.js';
import {
  clockInSchema,
  listEmployeeAttendanceQuerySchema,
  listMyAttendanceQuerySchema,
  patchAttendanceSchema,
  patchAttendanceSettingsSchema,
} from './attendance.validation.js';

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
  const mapped = mapAttendanceError(error);
  if (mapped instanceof AttendanceServiceError) {
    res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
    return;
  }
  throw error;
};

export const getAttendanceSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await getAttendanceSettings(req.tenantId!);
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    handleError(res, error);
  }
};

export const patchAttendanceSettingsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = patchAttendanceSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const settings = await patchAttendanceSettings(
      req.tenantId!,
      parsed.data.attendanceGpsEnabled,
      req.user!.sub
    );
    res.json({ status: 'ok', data: settings });
  } catch (error) {
    handleError(res, error);
  }
};

export const clockInHandler = (_env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = clockInSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const log = await clockIn(req.tenantId!, parsed.data, accessContext(req));
      res.status(201).json({ status: 'ok', data: log });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const clockOutHandler = (_env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const log = await clockOut(req.tenantId!, accessContext(req));
      res.json({ status: 'ok', data: log });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const getMyAttendanceStatusHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const status = await getMyAttendanceStatus(req.tenantId!, accessContext(req));
    res.json({ status: 'ok', data: status });
  } catch (error) {
    handleError(res, error);
  }
};

export const listMyAttendanceHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listMyAttendanceQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const result = await listMyAttendance(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const listEmployeeAttendanceHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listEmployeeAttendanceQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const result = await listEmployeeAttendance(
      req.tenantId!,
      req.params.employeeId!,
      parsed.data,
      accessContext(req)
    );
    res.json({ status: 'ok', data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const listTeamLiveHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const logs = await listTeamLive(req.tenantId!, accessContext(req));
    res.json({ status: 'ok', data: logs });
  } catch (error) {
    handleError(res, error);
  }
};

export const patchAttendanceHandler = (_env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = patchAttendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const log = await patchAttendanceLog(
        req.tenantId!,
        req.params.id!,
        parsed.data,
        accessContext(req),
        auditContext(req)
      );
      res.json({ status: 'ok', data: log });
    } catch (error) {
      handleError(res, error);
    }
  };
};
