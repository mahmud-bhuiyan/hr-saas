import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import { listAuditLogsHandler } from './audit.controller.js';

export const createAuditRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('settings'));

  router.get('/', authorizePermission('audit:read'), (req, res) => {
    void listAuditLogsHandler(req, res);
  });

  return router;
};
