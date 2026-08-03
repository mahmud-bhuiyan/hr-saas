import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  clockInHandler,
  clockOutHandler,
  getAttendanceSettingsHandler,
  getMyAttendanceCalendarHandler,
  getMyAttendanceStatusHandler,
  listEmployeeAttendanceHandler,
  listMyAttendanceHandler,
  listTeamLiveHandler,
  patchAttendanceHandler,
  patchAttendanceSettingsHandler,
} from './attendance.controller.js';

export const createAttendanceRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('attendance'));

  router.get('/settings', authorizePermission('attendance:clock:own'), (req, res) => {
    void getAttendanceSettingsHandler(req, res);
  });

  router.patch('/settings', authorize('company_admin'), (req, res) => {
    void patchAttendanceSettingsHandler(req, res);
  });

  router.post('/clock-in', authorizePermission('attendance:clock:own'), (req, res) => {
    void clockInHandler(env)(req, res);
  });

  router.post('/clock-out', authorizePermission('attendance:clock:own'), (req, res) => {
    void clockOutHandler(env)(req, res);
  });

  router.get('/me/status', authorizePermission('attendance:read:own'), (req, res) => {
    void getMyAttendanceStatusHandler(req, res);
  });

  router.get('/me/calendar', authorizePermission('attendance:read:own'), (req, res) => {
    void getMyAttendanceCalendarHandler(req, res);
  });

  router.get('/me', authorizePermission('attendance:read:own'), (req, res) => {
    void listMyAttendanceHandler(req, res);
  });

  router.get(
    '/employee/:employeeId',
    authorizePermission('attendance:manage', 'attendance:read:team'),
    (req, res) => {
      void listEmployeeAttendanceHandler(req, res);
    }
  );

  router.get(
    '/team/live',
    authorizePermission('attendance:read:team'),
    (req, res) => {
      void listTeamLiveHandler(req, res);
    }
  );

  router.patch('/:id', authorizePermission('attendance:manage'), (req, res) => {
    void patchAttendanceHandler(env)(req, res);
  });

  return router;
};
