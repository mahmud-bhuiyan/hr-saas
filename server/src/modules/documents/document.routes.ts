import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate, authorizePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  createDocumentHandler,
  deleteDocumentHandler,
  downloadDocumentHandler,
  getDocumentHandler,
  listDocumentsHandler,
  listExpiringDocumentsHandler,
  presignDocumentHandler,
} from './document.controller.js';

const documentReadPermissions = ['document:manage', 'document:read:own'] as const;

export const createDocumentRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.get(
    '/',
    authorizePermission(...documentReadPermissions),
    (req, res) => {
      void listDocumentsHandler(req, res);
    }
  );

  router.get(
    '/expiring',
    authorizePermission('document:manage'),
    (req, res) => {
      void listExpiringDocumentsHandler(req, res);
    }
  );

  router.post(
    '/presign',
    authorizePermission('document:manage', 'document:read:own'),
    (req, res) => {
      void presignDocumentHandler(env)(req, res);
    }
  );

  router.post(
    '/',
    authorizePermission('document:manage', 'document:read:own'),
    (req, res) => {
      void createDocumentHandler(env)(req, res);
    }
  );

  router.get(
    '/:id',
    authorizePermission(...documentReadPermissions),
    (req, res) => {
      void getDocumentHandler(req, res);
    }
  );

  router.get(
    '/:id/download',
    authorizePermission(...documentReadPermissions),
    (req, res) => {
      void downloadDocumentHandler(env)(req, res);
    }
  );

  router.delete('/:id', authorizePermission('document:manage'), (req, res) => {
    void deleteDocumentHandler(env)(req, res);
  });

  return router;
};
