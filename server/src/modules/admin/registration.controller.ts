import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  RegistrationServiceError,
  activateCompany,
  approveRegistration,
  createCompany,
  deactivateCompany,
  getTenantModules,
  listRegistrationRequests,
  rejectRegistration,
  updateCompany,
  updateTenantModules,
} from './registration.service.js';
import {
  createCompanySchema,
  rejectRegistrationSchema,
  updateCompanySchema,
  updateTenantModulesSchema,
} from './registration.validation.js';
import type { TenantApprovalStatus } from '../auth/tenant.model.js';

export const createCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const parsed = createCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const company = await createCompany(parsed.data, req.user.sub);
    res.status(201).json({ status: 'ok', data: company });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const listRegistrationsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const status = req.query.status as TenantApprovalStatus | undefined;
    const registrations = await listRegistrationRequests(status);
    res.json({ status: 'ok', data: { registrations } });
  } catch {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const approveRegistrationHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const registration = await approveRegistration(req.params.tenantId!, req.user.sub);
    res.json({ status: 'ok', data: registration });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const rejectRegistrationHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const parsed = rejectRegistrationSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const registration = await rejectRegistration(
      req.params.tenantId!,
      req.user.sub,
      parsed.data.reason
    );
    res.json({ status: 'ok', data: registration });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const updateCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const parsed = updateCompanySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const company = await updateCompany(req.params.tenantId!, parsed.data, req.user.sub);
    res.json({ status: 'ok', data: company });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const deactivateCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const company = await deactivateCompany(req.params.tenantId!, req.user.sub);
    res.json({ status: 'ok', data: company });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const activateCompanyHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const company = await activateCompany(req.params.tenantId!, req.user.sub);
    res.json({ status: 'ok', data: company });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const getTenantModulesHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const modules = await getTenantModules(req.params.tenantId!);
    res.json({ status: 'ok', data: modules });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const updateTenantModulesHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const parsed = updateTenantModulesSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const modules = await updateTenantModules(
      req.params.tenantId!,
      parsed.data,
      req.user.sub
    );
    res.json({ status: 'ok', data: modules });
  } catch (error) {
    if (error instanceof RegistrationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
