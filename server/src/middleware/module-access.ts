import type { NextFunction, Response } from 'express';
import { Tenant } from '../modules/auth/tenant.model.js';
import {
  resolveEnabledModules,
  type TenantModuleId,
} from '../types/modules.js';
import type { AuthenticatedRequest } from './auth.js';

export const requireModule = (moduleId: TenantModuleId) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    if (req.tenantModules) {
      if (!req.tenantModules.includes(moduleId)) {
        res.status(403).json({
          status: 'error',
          message: 'This module is not enabled for your company',
        });
        return;
      }

      next();
      return;
    }

    const tenant = await Tenant.findById(req.tenantId).select('enabledModules').lean();
    const enabled = resolveEnabledModules(tenant?.enabledModules);
    req.tenantModules = enabled;

    if (!enabled.includes(moduleId)) {
      res.status(403).json({
        status: 'error',
        message: 'This module is not enabled for your company',
      });
      return;
    }

    next();
  };
};
