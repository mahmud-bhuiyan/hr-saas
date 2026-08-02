import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  createShiftHandler,
  deleteShiftHandler,
  getRotaWeekHandler,
  patchShiftHandler,
  publishRotaHandler,
} from './rota.controller.js';

export const createRotaRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.post('/publish', authorizePermission('rota:manage'), (req, res) => {
    void publishRotaHandler(req, res);
  });

  router.post('/shifts', authorizePermission('rota:manage'), (req, res) => {
    void createShiftHandler(req, res);
  });

  router.patch('/shifts/:id', authorizePermission('rota:manage'), (req, res) => {
    void patchShiftHandler(req, res);
  });

  router.delete('/shifts/:id', authorizePermission('rota:manage'), (req, res) => {
    void deleteShiftHandler(req, res);
  });

  router.get(
    '/:weekOf',
    authorizePermission('rota:read', 'rota:read:own'),
    (req, res) => {
      void getRotaWeekHandler(req, res);
    }
  );

  return router;
};
