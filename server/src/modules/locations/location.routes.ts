import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  createLocationHandler,
  listLocationsHandler,
  patchLocationHandler,
} from './location.controller.js';

export const createLocationRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('rotas'));

  router.get('/', authorizePermission('location:read'), (req, res) => {
    void listLocationsHandler(req, res);
  });

  router.post('/', authorizePermission('location:manage'), (req, res) => {
    void createLocationHandler(req, res);
  });

  router.patch('/:id', authorizePermission('location:manage'), (req, res) => {
    void patchLocationHandler(req, res);
  });

  return router;
};
