import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  approveRegistrationHandler,
  listRegistrationsHandler,
  rejectRegistrationHandler,
} from './registration.controller.js';

export function createRegistrationRoutes(env: ServerEnv): Router {
  const router = Router();

  router.use(authenticate(env), authorize('super_admin'));

  router.get('/', (req, res) => {
    void listRegistrationsHandler(req, res);
  });

  router.post('/:tenantId/approve', (req, res) => {
    void approveRegistrationHandler(req, res);
  });

  router.post('/:tenantId/reject', (req, res) => {
    void rejectRegistrationHandler(req, res);
  });

  return router;
}
