import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  approveTimesheetHandler,
  declineTimesheetHandler,
  generateTimesheetHandler,
  getMyTimesheetForWeekHandler,
  listMyTimesheetsHandler,
  listTimesheetsHandler,
  patchTimesheetHandler,
  submitTimesheetHandler,
} from './timesheet.controller.js';

export const createTimesheetRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('timesheets'));

  router.post('/generate', authorizePermission('timesheet:read:own'), (req, res) => {
    void generateTimesheetHandler(env)(req, res);
  });

  router.get('/me', authorizePermission('timesheet:read:own'), (req, res) => {
    void listMyTimesheetsHandler(req, res);
  });

  router.get('/me/:weekOf', authorizePermission('timesheet:read:own'), (req, res) => {
    void getMyTimesheetForWeekHandler(req, res);
  });

  router.get(
    '/',
    authorizePermission('timesheet:approve', 'timesheet:approve:team'),
    (req, res) => {
      void listTimesheetsHandler(req, res);
    }
  );

  router.patch('/:id', authorizePermission('timesheet:submit:own'), (req, res) => {
    void patchTimesheetHandler(env)(req, res);
  });

  router.post('/:id/submit', authorizePermission('timesheet:submit:own'), (req, res) => {
    void submitTimesheetHandler(env)(req, res);
  });

  router.post(
    '/:id/approve',
    authorizePermission('timesheet:approve', 'timesheet:approve:team'),
    (req, res) => {
      void approveTimesheetHandler(env)(req, res);
    }
  );

  router.post(
    '/:id/decline',
    authorizePermission('timesheet:approve', 'timesheet:approve:team'),
    (req, res) => {
      void declineTimesheetHandler(env)(req, res);
    }
  );

  return router;
};
