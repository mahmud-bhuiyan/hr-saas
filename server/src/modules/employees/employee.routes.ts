import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireModule } from '../../middleware/module-access.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  commitEmployeeImportHandler,
  createEmployeeHandler,
  getEmployeeHandler,
  getMyEmployeeHandler,
  inviteEmployeeHandler,
  listDepartmentsHandler,
  listDirectReportsHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
  validateEmployeeImportHandler,
} from './employee.controller.js';

export const createEmployeeRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant(), requireModule('employees'));

  router.get(
    '/',
    authorizePermission('employee:read', 'employee:read:team'),
    (req, res) => {
      void listEmployeesHandler(req, res);
    }
  );

  router.get(
    '/departments',
    authorizePermission('employee:read', 'employee:read:team'),
    (req, res) => {
      void listDepartmentsHandler(req, res);
    }
  );

  router.post('/', authorizePermission('employee:create'), (req, res) => {
    void createEmployeeHandler(req, res);
  });

  router.post('/import/validate', authorizePermission('employee:create'), (req, res) => {
    void validateEmployeeImportHandler(req, res);
  });

  router.post('/import/commit', authorizePermission('employee:create'), (req, res) => {
    void commitEmployeeImportHandler(req, res);
  });

  router.get('/me', (req, res) => {
    void getMyEmployeeHandler(req, res);
  });

  router.get(
    '/:id',
    authorizePermission('employee:read', 'employee:read:team'),
    (req, res) => {
      void getEmployeeHandler(req, res);
    }
  );

  router.get(
    '/:id/reports',
    authorizePermission('employee:read', 'employee:read:team'),
    (req, res) => {
      void listDirectReportsHandler(req, res);
    }
  );

  router.patch('/:id', authorizePermission('employee:update'), (req, res) => {
    void updateEmployeeHandler(req, res);
  });

  router.post('/:id/invite', authorizePermission('employee:create'), (req, res) => {
    void inviteEmployeeHandler(env)(req, res);
  });

  return router;
}
