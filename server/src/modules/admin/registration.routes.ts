import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  activateCompanyHandler,
  approveRegistrationHandler,
  createCompanyHandler,
  deactivateCompanyHandler,
  getTenantModulesHandler,
  listRegistrationsHandler,
  rejectRegistrationHandler,
  updateCompanyHandler,
  updateTenantModulesHandler,
} from './registration.controller.js';

export const createRegistrationRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), authorize('super_admin'));

  router.get('/', (req, res) => {
    void listRegistrationsHandler(req, res);
  });

  router.post('/', (req, res) => {
    void createCompanyHandler(req, res);
  });

  router.post('/:tenantId/approve', (req, res) => {
    void approveRegistrationHandler(req, res);
  });

  router.post('/:tenantId/reject', (req, res) => {
    void rejectRegistrationHandler(req, res);
  });

  router.patch('/:tenantId', (req, res) => {
    void updateCompanyHandler(req, res);
  });

  router.get('/:tenantId/modules', (req, res) => {
    void getTenantModulesHandler(req, res);
  });

  router.patch('/:tenantId/modules', (req, res) => {
    void updateTenantModulesHandler(req, res);
  });

  router.post('/:tenantId/deactivate', (req, res) => {
    void deactivateCompanyHandler(req, res);
  });

  router.post('/:tenantId/activate', (req, res) => {
    void activateCompanyHandler(req, res);
  });

  return router;
}
