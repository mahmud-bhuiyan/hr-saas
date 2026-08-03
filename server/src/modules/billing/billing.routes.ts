import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  billingStatusHandler,
  checkoutSessionHandler,
  portalSessionHandler,
} from './billing.controller.js';

export const createBillingRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('settings'), authorize('company_admin'));

  router.get('/status', (req, res) => {
    void billingStatusHandler(req, res);
  });

  router.post('/checkout-session', checkoutSessionHandler(env));
  router.post('/portal-session', portalSessionHandler(env));

  return router;
};
