import { Router } from "express";
import type { ServerEnv } from "../../config/env.js";
import { authenticate } from "../../middleware/auth.js";
import { requireTenant } from "../../middleware/tenant.js";
import { listTenantCountryDialCodesHandler } from "./country-dial-code.controller.js";

export const createCountryDialCodeRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), requireTenant());

  router.get("/", (req, res) => {
    void listTenantCountryDialCodesHandler(req, res);
  });

  return router;
};
