import { Router } from 'express';
import { getSiteConfigHandler } from './platform-settings.controller.js';

export const createPlatformRoutes = (): Router => {
  const router = Router();

  router.get('/site-config', (req, res) => {
    void getSiteConfigHandler(req, res);
  });

  return router;
};
