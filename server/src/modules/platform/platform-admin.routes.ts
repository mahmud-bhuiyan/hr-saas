import { Router } from "express";
import type { ServerEnv } from "../../config/env.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  createCountryDialCodeHandler,
  listManagedCountryDialCodesHandler,
  patchCountryDialCodeHandler,
} from "../settings/country-dial-code.controller.js";
import {
  getPlatformSiteSettingsHandler,
  patchPlatformSiteSettingsHandler,
  uploadPlatformAssetHandler,
} from "./platform-settings.controller.js";

export const createPlatformAdminRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env), authorize("super_admin"));

  router.get("/site-settings", (req, res) => {
    void getPlatformSiteSettingsHandler(req, res);
  });

  router.patch("/site-settings", (req, res) => {
    void patchPlatformSiteSettingsHandler(req, res);
  });

  router.post("/site-settings/upload", (req, res) => {
    void uploadPlatformAssetHandler(env)(req, res);
  });

  router.get("/country-dial-codes", (req, res) => {
    void listManagedCountryDialCodesHandler(req, res);
  });

  router.post("/country-dial-codes", (req, res) => {
    void createCountryDialCodeHandler(req, res);
  });

  router.patch("/country-dial-codes/:id", (req, res) => {
    void patchCountryDialCodeHandler(req, res);
  });

  return router;
};
