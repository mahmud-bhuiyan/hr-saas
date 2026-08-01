import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  createEmployeeHandler,
  getEmployeeHandler,
  listDepartmentsHandler,
  listDirectReportsHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
} from './employee.controller.js';

export const createEmployeeRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

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

  return router;
}
