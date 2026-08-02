import { Router } from 'express';
import type { ServerEnv } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';
import {
  createLoginHandler,
  createLogoutHandler,
  createRefreshHandler,
  createRegisterHandler,
  createUpdateMeHandler,
  createUploadAvatarHandler,
  createForgotPasswordHandler,
  createResetPasswordHandler,
  meHandler,
} from './auth.controller.js';

export const createAuthRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.post('/register', createRegisterHandler(env));
  router.post('/login', createLoginHandler(env));
  router.post('/forgot-password', createForgotPasswordHandler(env));
  router.post('/reset-password', createResetPasswordHandler());
  router.post('/refresh', createRefreshHandler(env));
  router.post('/logout', createLogoutHandler());
  router.get('/me', authenticate(env), (req, res) => {
    void meHandler(req, res);
  });
  router.patch('/me', authenticate(env), createUpdateMeHandler(env));
  router.post('/me/avatar', authenticate(env), createUploadAvatarHandler(env));

  return router;
}
