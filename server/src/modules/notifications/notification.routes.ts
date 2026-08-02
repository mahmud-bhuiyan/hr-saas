import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import {
  listNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
  unreadCountHandler,
} from './notification.controller.js';

export const createNotificationRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.get('/', (req, res) => {
    void listNotificationsHandler(req, res);
  });

  router.get('/unread-count', (req, res) => {
    void unreadCountHandler(req, res);
  });

  router.patch('/:id/read', (req, res) => {
    void markReadHandler(req, res);
  });

  router.post('/read-all', (req, res) => {
    void markAllReadHandler(req, res);
  });

  return router;
};
