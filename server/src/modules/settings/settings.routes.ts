import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireTenant, resolveTenant } from '../../middleware/tenant.js';
import {
  getEffectiveBrandingHandler,
  getTenantBrandingSettingsHandler,
  patchTenantBrandingHandler,
} from '../platform/platform-settings.controller.js';

export const createSettingsRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env));

  router.get('/branding', resolveTenant(), (req, res) => {
    void getEffectiveBrandingHandler(req, res);
  });

  router.get('/branding/overrides', requireTenant(), authorize('company_admin'), (req, res) => {
    void getTenantBrandingSettingsHandler(req, res);
  });

  router.patch('/branding', requireTenant(), authorize('company_admin'), (req, res) => {
    void patchTenantBrandingHandler(req, res);
  });

  return router;
};
