import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requireTenant, resolveTenant } from '../../middleware/tenant.js';
import {
  getEffectiveBrandingHandler,
  getTenantBrandingSettingsHandler,
  patchTenantBrandingHandler,
} from '../platform/platform-settings.controller.js';
import {
  getCompanyProfileHandler,
  patchCompanyProfileHandler,
} from './company.controller.js';
import {
  createDepartmentHandler,
  listDepartmentsHandler,
  patchDepartmentHandler,
} from './department.controller.js';
import {
  listTenantUsersHandler,
  patchTenantUserHandler,
} from './users.controller.js';

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

  router.get('/company', requireTenant(), authorize('company_admin'), (req, res) => {
    void getCompanyProfileHandler(req, res);
  });

  router.patch('/company', requireTenant(), authorize('company_admin'), (req, res) => {
    void patchCompanyProfileHandler(req, res);
  });

  router.get(
    '/departments',
    requireTenant(),
    authorize('company_admin', 'hr_manager'),
    (req, res) => {
      void listDepartmentsHandler(req, res);
    }
  );

  router.post(
    '/departments',
    requireTenant(),
    authorize('company_admin', 'hr_manager'),
    (req, res) => {
      void createDepartmentHandler(req, res);
    }
  );

  router.patch(
    '/departments/:id',
    requireTenant(),
    authorize('company_admin', 'hr_manager'),
    (req, res) => {
      void patchDepartmentHandler(req, res);
    }
  );

  router.get('/users', requireTenant(), authorize('company_admin'), (req, res) => {
    void listTenantUsersHandler(req, res);
  });

  router.patch('/users/:id', requireTenant(), authorize('company_admin'), (req, res) => {
    void patchTenantUserHandler(req, res);
  });

  return router;
};
