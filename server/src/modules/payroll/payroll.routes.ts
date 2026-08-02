import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  createPayrollPeriodHandler,
  generatePayrollPeriodHandler,
  getPayrollPeriodHandler,
  listPayrollPeriodsHandler,
} from './payroll.controller.js';

export const createPayrollRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.get('/periods', authorizePermission('payroll:read'), (req, res) => {
    void listPayrollPeriodsHandler(req, res);
  });

  router.post('/periods', authorizePermission('payroll:generate'), (req, res) => {
    void createPayrollPeriodHandler(req, res);
  });

  router.get('/periods/:id', authorizePermission('payroll:read'), (req, res) => {
    void getPayrollPeriodHandler(req, res);
  });

  router.post('/periods/:id/generate', authorizePermission('payroll:generate'), (req, res) => {
    void generatePayrollPeriodHandler(req, res);
  });

  return router;
};
