import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type { AuditContext } from '../audit/audit.service.js';
import {
  commitEmployeeImport,
  validateEmployeeImport,
} from './employee-import.service.js';
import {
  EmployeeServiceError,
  createEmployee,
  getEmployeeById,
  getMyEmployee,
  inviteEmployee,
  listDepartments,
  listDirectReports,
  listEmployees,
  updateEmployee,
} from './employee.service.js';
import {
  createEmployeeSchema,
  employeeImportCommitSchema,
  employeeImportCsvSchema,
  inviteEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from './employee.validation.js';

const accessContext = (req: AuthenticatedRequest) => {
  return {
    userId: req.user!.sub,
    role: req.user!.role,
  };
};

const auditContext = (req: AuthenticatedRequest): AuditContext => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

export const listEmployeesHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listEmployeesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const employees = await listEmployees(req.tenantId!, parsed.data, accessContext(req));

    res.json({ status: 'ok', data: { employees } });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const listDepartmentsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const departments = await listDepartments(req.tenantId!);
    res.json({ status: 'ok', data: { departments } });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const getMyEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const employee = await getMyEmployee(req.tenantId!, req.user!.sub);

    res.json({ status: 'ok', data: { employee } });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const getEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const employee = await getEmployeeById(
      req.tenantId!,
      req.params.id,
      accessContext(req)
    );

    res.json({ status: 'ok', data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const listDirectReportsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reports = await listDirectReports(
      req.tenantId!,
      req.params.id,
      accessContext(req)
    );

    res.json({ status: 'ok', data: { reports } });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const createEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const employee = await createEmployee(
      req.tenantId!,
      parsed.data,
      req.user!.sub,
      auditContext(req)
    );

    res.status(201).json({ status: 'ok', data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const updateEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const employee = await updateEmployee(
      req.tenantId!,
      req.params.id,
      parsed.data,
      req.user!.sub,
      auditContext(req)
    );

    res.json({ status: 'ok', data: employee });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const validateEmployeeImportHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = employeeImportCsvSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const result = await validateEmployeeImport(req.tenantId!, parsed.data.csv);
    res.json({ status: 'ok', data: result });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const commitEmployeeImportHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = employeeImportCommitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const result = await commitEmployeeImport(
      req.tenantId!,
      parsed.data.rows,
      req.user!.sub,
      auditContext(req)
    );

    res.status(201).json({ status: 'ok', data: result });
  } catch (error) {
    if (error instanceof EmployeeServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const inviteEmployeeHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = inviteEmployeeSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const employee = await inviteEmployee(
        req.tenantId!,
        req.params.id,
        parsed.data,
        req.user!.sub,
        env,
        auditContext(req)
      );

      res.json({ status: 'ok', data: employee });
    } catch (error) {
      if (error instanceof EmployeeServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }

      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};
