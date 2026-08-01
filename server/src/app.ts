import cors from 'cors';
import express from 'express';
import { loadServerEnv } from './config/env.js';
import { APP_NAME } from './constants/app.js';
import { createAdminRoutes } from './modules/admin/admin.routes.js';
import type { ApiHealthResponse } from './types/index.js';

export function createApp() {
  const env = loadServerEnv();
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('text').send('Server is running');
  });

  const v1 = express.Router();

  v1.get('/health', (_req, res) => {
    const response: ApiHealthResponse = {
      status: 'ok',
      service: APP_NAME,
      timestamp: new Date().toISOString(),
    };
    res.json(response);
  });

  v1.use('/admins', createAdminRoutes(env));

  app.use('/api/v1', v1);

  return app;
}
