import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  approveExpenseHandler,
  createExpenseHandler,
  declineExpenseHandler,
  exportExpensesHandler,
  getExpenseHandler,
  getExpenseReceiptHandler,
  listExpensesHandler,
  patchExpenseHandler,
  presignExpenseHandler,
} from './expense.controller.js';

export const createExpenseRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.post('/presign', authorizePermission('expense:create:own'), (req, res) => {
    void presignExpenseHandler(env)(req, res);
  });

  router.get('/export', authorizePermission('expense:export'), (req, res) => {
    void exportExpensesHandler(req, res);
  });

  router.get(
    '/',
    authorizePermission(
      'expense:read:own',
      'expense:approve',
      'expense:approve:team'
    ),
    (req, res) => {
      void listExpensesHandler(req, res);
    }
  );

  router.post('/', authorizePermission('expense:create:own'), (req, res) => {
    void createExpenseHandler(env)(req, res);
  });

  router.get(
    '/:id',
    authorizePermission(
      'expense:read:own',
      'expense:approve',
      'expense:approve:team'
    ),
    (req, res) => {
      void getExpenseHandler(req, res);
    }
  );

  router.patch('/:id', authorizePermission('expense:create:own'), (req, res) => {
    void patchExpenseHandler(req, res);
  });

  router.get(
    '/:id/receipt',
    authorizePermission(
      'expense:read:own',
      'expense:approve',
      'expense:approve:team'
    ),
    (req, res) => {
      void getExpenseReceiptHandler(env)(req, res);
    }
  );

  router.post(
    '/:id/approve',
    authorizePermission('expense:approve', 'expense:approve:team'),
    (req, res) => {
      void approveExpenseHandler(env)(req, res);
    }
  );

  router.post(
    '/:id/decline',
    authorizePermission('expense:approve', 'expense:approve:team'),
    (req, res) => {
      void declineExpenseHandler(env)(req, res);
    }
  );

  return router;
};
