import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { S3ServiceError } from '../documents/s3.service.js';
import {
  ExpenseServiceError,
  approveExpense,
  createExpense,
  declineExpense,
  exportExpensesCsv,
  getExpenseById,
  getExpenseReceiptDownloadUrl,
  listExpenses,
  mapExpenseError,
  patchExpense,
  presignExpenseUpload,
} from './expense.service.js';
import {
  createExpenseSchema,
  declineExpenseSchema,
  exportExpensesQuerySchema,
  listExpensesQuerySchema,
  patchExpenseSchema,
  presignExpenseSchema,
} from './expense.validation.js';

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
  const mapped = mapExpenseError(error);
  if (mapped instanceof ExpenseServiceError || mapped instanceof S3ServiceError) {
    res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
    return;
  }
  throw mapped;
};

export const presignExpenseHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = presignExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const result = await presignExpenseUpload(env, req.tenantId!, parsed.data, accessContext(req));
      res.json({ status: 'ok', data: result });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const createExpenseHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = createExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const expense = await createExpense(
        env,
        req.tenantId!,
        parsed.data,
        accessContext(req),
        auditContext(req)
      );
      res.status(201).json({ status: 'ok', data: expense });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const listExpensesHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listExpensesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const result = await listExpenses(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getExpenseHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const expense = await getExpenseById(req.tenantId!, req.params.id!, accessContext(req));
    res.json({ status: 'ok', data: expense });
  } catch (error) {
    handleError(res, error);
  }
};

export const patchExpenseHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = patchExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const expense = await patchExpense(
      req.tenantId!,
      req.params.id!,
      parsed.data,
      accessContext(req),
      auditContext(req)
    );
    res.json({ status: 'ok', data: expense });
  } catch (error) {
    handleError(res, error);
  }
};

export const approveExpenseHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const expense = await approveExpense(
        req.tenantId!,
        req.params.id!,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: expense });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const declineExpenseHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = declineExpenseSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
        return;
      }

      const expense = await declineExpense(
        req.tenantId!,
        req.params.id!,
        parsed.data.declineReason,
        accessContext(req),
        env,
        auditContext(req)
      );
      res.json({ status: 'ok', data: expense });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const getExpenseReceiptHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await getExpenseReceiptDownloadUrl(
        env,
        req.tenantId!,
        req.params.id!,
        accessContext(req)
      );
      res.json({ status: 'ok', data: result });
    } catch (error) {
      handleError(res, error);
    }
  };
};

export const exportExpensesHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = exportExpensesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ status: 'error', message: parsed.error.issues[0]?.message });
      return;
    }

    const csv = await exportExpensesCsv(req.tenantId!, parsed.data, accessContext(req));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses-export.csv"');
    res.send(csv);
  } catch (error) {
    handleError(res, error);
  }
};
