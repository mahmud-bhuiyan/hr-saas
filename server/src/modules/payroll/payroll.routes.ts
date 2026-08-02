import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  accountingCallbackHandler,
  accountingConnectHandler,
  accountingDisconnectHandler,
  accountingStatusHandler,
  syncPayrollPeriodHandler,
} from './accounting.controller.js';
import {
  createPayrollPeriodHandler,
  exportPayrollPeriodHandler,
  generatePayrollPeriodHandler,
  getPayrollPeriodHandler,
  listPayrollPeriodsHandler,
} from './payroll.controller.js';

export const createPayrollRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.get('/accounting/callback', accountingCallbackHandler(env));

  router.use(authenticate(env), requireTenant());

  router.get('/accounting/status', authorizePermission('payroll:export'), accountingStatusHandler(env));
  router.get('/accounting/connect', authorize('company_admin'), accountingConnectHandler(env));
  router.delete('/accounting/disconnect', authorize('company_admin'), accountingDisconnectHandler());

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

  router.get('/periods/:id/export', authorizePermission('payroll:export'), (req, res) => {
    void exportPayrollPeriodHandler(req, res);
  });

  router.post('/periods/:id/sync', authorizePermission('payroll:export'), syncPayrollPeriodHandler(env));

  return router;
};
