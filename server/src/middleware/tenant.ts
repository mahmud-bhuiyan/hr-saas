import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './auth.js';

export function resolveTenant() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    if (!req.user.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    req.tenantId = req.user.tenantId;
    next();
  };
}

/** Requires a tenant on the request — blocks super_admin without tenantId. */
export function requireTenant() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    if (!req.user.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    req.tenantId = req.user.tenantId;
    next();
  };
}
