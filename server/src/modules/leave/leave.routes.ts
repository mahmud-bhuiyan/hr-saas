import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  approveLeaveRequestHandler,
  cancelLeaveRequestHandler,
  countPendingLeaveHandler,
  createLeaveRequestHandler,
  declineLeaveRequestHandler,
  getEmployeeLeaveBalanceHandler,
  getLeaveCalendarHandler,
  getLeaveRequestHandler,
  getMyLeaveBalanceHandler,
  listLeaveRequestsHandler,
} from './leave.controller.js';

export const createLeaveRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('leave'));

  router.get(
    '/requests',
    authorizePermission(
      'leave:read:own',
      'leave:approve',
      'leave:approve:team'
    ),
    (req, res) => {
      void listLeaveRequestsHandler(req, res);
    }
  );

  router.post('/requests', authorizePermission('leave:create:own'), (req, res) => {
    void createLeaveRequestHandler(env)(req, res);
  });

  router.get(
    '/requests/:id',
    authorizePermission(
      'leave:read:own',
      'leave:approve',
      'leave:approve:team'
    ),
    (req, res) => {
      void getLeaveRequestHandler(req, res);
    }
  );

  router.post('/requests/:id/cancel', authorizePermission('leave:create:own'), (req, res) => {
    void cancelLeaveRequestHandler(req, res);
  });

  router.post(
    '/requests/:id/approve',
    authorizePermission('leave:approve', 'leave:approve:team'),
    (req, res) => {
      void approveLeaveRequestHandler(env)(req, res);
    }
  );

  router.post(
    '/requests/:id/decline',
    authorizePermission('leave:approve', 'leave:approve:team'),
    (req, res) => {
      void declineLeaveRequestHandler(env)(req, res);
    }
  );

  router.get('/balances/me', authorizePermission('leave:read:own'), (req, res) => {
    void getMyLeaveBalanceHandler(req, res);
  });

  router.get('/balances/:employeeId', authorizePermission('leave:approve'), (req, res) => {
    void getEmployeeLeaveBalanceHandler(req, res);
  });

  router.get(
    '/calendar',
    authorizePermission('leave:approve', 'leave:approve:team'),
    (req, res) => {
      void getLeaveCalendarHandler(req, res);
    }
  );

  router.get(
    '/pending-count',
    authorizePermission('leave:approve', 'leave:approve:team'),
    (req, res) => {
      void countPendingLeaveHandler(req, res);
    }
  );

  return router;
};
