import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  EmployeeServiceError,
  createEmployee,
  getEmployeeById,
  listDepartments,
  listDirectReports,
  listEmployees,
  updateEmployee,
} from './employee.service.js';
import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from './employee.validation.js';

const accessContext = (req: AuthenticatedRequest) => {
  return {
    userId: req.user!.sub,
    role: req.user!.role,
  };
}

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

    const employee = await createEmployee(req.tenantId!, parsed.data, req.user!.sub);

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
      req.user!.sub
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
