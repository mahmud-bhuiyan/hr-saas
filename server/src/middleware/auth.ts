import type { NextFunction, Request, Response } from 'express';
import type { ServerEnv } from '../config/env.js';
import type { JwtPayload } from '../utils/jwt.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { hasPermission } from '../utils/permissions.js';
import type { UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  tenantId?: string;
}

export function authenticate(env: ServerEnv) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const token = header.slice(7);

    try {
      req.user = verifyAccessToken(token, env.adminJwtSecret);
      next();
    } catch {
      res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }
  };
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    if (req.user.role === 'super_admin' || roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
  };
}

export function optionalAuthenticate(env: ServerEnv) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = header.slice(7);

    try {
      req.user = verifyAccessToken(token, env.adminJwtSecret);
    } catch {
      // Ignore invalid token — route handler decides if auth is required
    }

    next();
  };
}

export function authorizePermission(...permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const allowed = permissions.some((p) => hasPermission(req.user!.role, p));
    if (!allowed) {
      res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
