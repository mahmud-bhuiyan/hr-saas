import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  absenceSummaryReportHandler,
  headcountReportHandler,
} from './report.controller.js';

export const createReportRoutes = (_env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(_env), requireTenant(), requireModule('reports'));

  router.get('/headcount', authorizePermission('report:read'), (req, res) => {
    void headcountReportHandler(req, res);
  });

  router.get('/absence-summary', authorizePermission('report:read'), (req, res) => {
    void absenceSummaryReportHandler(req, res);
  });

  return router;
};
