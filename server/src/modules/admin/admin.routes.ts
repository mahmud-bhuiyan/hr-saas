import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { optionalAuthenticate } from '../../middleware/auth.js';
import { createAdminHandler } from './admin.controller.js';

export function createAdminRoutes(env: ServerEnv): Router {
  const router = Router();

  router.post('/', optionalAuthenticate(env), (req, res) => {
    void createAdminHandler(req, res);
  });

  return router;
}
