import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type { AuditContext } from '../audit/audit.service.js';
import {
  LeaveServiceError,
  approveLeaveRequest,
  cancelLeaveRequest,
  countPendingLeaveRequests,
  createLeaveRequest,
  declineLeaveRequest,
  getEmployeeLeaveBalance,
  getLeaveCalendar,
  getLeaveRequestById,
  getMyLeaveBalance,
  listLeaveRequests,
} from './leave.service.js';
import {
  createLeaveRequestSchema,
  declineLeaveRequestSchema,
  leaveCalendarQuerySchema,
  listLeaveRequestsQuerySchema,
} from './leave.validation.js';

const accessContext = (req: AuthenticatedRequest) => ({
  userId: req.user!.sub,
  userEmail: req.user!.email,
  role: req.user!.role,
});

const auditContext = (req: AuthenticatedRequest): AuditContext => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

export const listLeaveRequestsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listLeaveRequestsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const requests = await listLeaveRequests(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: { requests } });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getLeaveRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const request = await getLeaveRequestById(req.tenantId!, req.params.id, accessContext(req));
    res.json({ status: 'ok', data: request });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createLeaveRequestHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = createLeaveRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const request = await createLeaveRequest(
        req.tenantId!,
        parsed.data,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.status(201).json({ status: 'ok', data: request });
    } catch (error) {
      if (error instanceof LeaveServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const cancelLeaveRequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const request = await cancelLeaveRequest(
      req.tenantId!,
      req.params.id,
      accessContext(req),
      auditContext(req)
    );
    res.json({ status: 'ok', data: request });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const approveLeaveRequestHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = await approveLeaveRequest(
        req.tenantId!,
        req.params.id,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: request });
    } catch (error) {
      if (error instanceof LeaveServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const declineLeaveRequestHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = declineLeaveRequestSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const request = await declineLeaveRequest(
        req.tenantId!,
        req.params.id,
        parsed.data.declineReason,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: request });
    } catch (error) {
      if (error instanceof LeaveServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const getMyLeaveBalanceHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const balance = await getMyLeaveBalance(req.tenantId!, accessContext(req));
    res.json({ status: 'ok', data: balance });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getEmployeeLeaveBalanceHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const balance = await getEmployeeLeaveBalance(req.tenantId!, req.params.employeeId);
    res.json({ status: 'ok', data: balance });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getLeaveCalendarHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = leaveCalendarQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const entries = await getLeaveCalendar(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: { entries } });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const countPendingLeaveHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await countPendingLeaveRequests(req.tenantId!, accessContext(req));
    res.json({ status: 'ok', data: { count } });
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
