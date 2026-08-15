import { Router } from "express";
import type { ServerEnv } from "../../config/env.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { requireModule } from "../../middleware/module-access.js";
import { requireTenant, resolveTenant } from "../../middleware/tenant.js";
import {
  getLeaveSettingsHandler,
  patchLeaveSettingsHandler,
} from "../leave/leave-settings.controller.js";
import {
  getEffectiveBrandingHandler,
  getTenantBrandingSettingsHandler,
  patchTenantBrandingHandler,
} from "../platform/platform-settings.controller.js";
import {
  getCompanyProfileHandler,
  patchCompanyProfileHandler,
} from "./company.controller.js";
import {
  getPayrollSettingsHandler,
  patchPayrollSettingsHandler,
} from "./payroll-settings.controller.js";
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  listDepartmentsHandler,
  patchDepartmentHandler,
} from "./department.controller.js";
import {
  listTenantUsersHandler,
  patchTenantUserHandler,
} from "./users.controller.js";

export const createSettingsRoutes = (env: ServerEnv): Router => {
  const router = Router();

  router.use(authenticate(env));

  router.get("/branding", resolveTenant(), (req, res) => {
    void getEffectiveBrandingHandler(req, res);
  });

  router.use(requireTenant(), requireModule("settings"));

  router.get("/branding/overrides", authorize("company_admin"), (req, res) => {
    void getTenantBrandingSettingsHandler(req, res);
  });

  router.patch("/branding", authorize("company_admin"), (req, res) => {
    void patchTenantBrandingHandler(req, res);
  });

  router.get("/company", authorize("company_admin"), (req, res) => {
    void getCompanyProfileHandler(req, res);
  });

  router.patch("/company", authorize("company_admin"), (req, res) => {
    void patchCompanyProfileHandler(req, res);
  });

  router.get(
    "/departments",
    authorize("company_admin", "hr_manager"),
    (req, res) => {
      void listDepartmentsHandler(req, res);
    },
  );

  router.post(
    "/departments",
    authorize("company_admin", "hr_manager"),
    (req, res) => {
      void createDepartmentHandler(req, res);
    },
  );

  router.patch(
    "/departments/:id",
    authorize("company_admin", "hr_manager"),
    (req, res) => {
      void patchDepartmentHandler(req, res);
    },
  );

  router.delete(
    "/departments/:id",
    authorize("company_admin", "hr_manager"),
    (req, res) => {
      void deleteDepartmentHandler(req, res);
    },
  );

  router.get("/users", authorize("company_admin"), (req, res) => {
    void listTenantUsersHandler(req, res);
  });

  router.patch("/users/:id", authorize("company_admin"), (req, res) => {
    void patchTenantUserHandler(req, res);
  });

  router.get(
    "/leave",
    authorize("company_admin", "hr_manager", "manager"),
    (req, res) => {
      void getLeaveSettingsHandler(req, res);
    },
  );

  router.patch("/leave", authorize("company_admin"), (req, res) => {
    void patchLeaveSettingsHandler(req, res);
  });

  router.get("/payroll", authorize("company_admin"), (req, res) => {
    void getPayrollSettingsHandler(req, res);
  });

  router.patch("/payroll", authorize("company_admin"), (req, res) => {
    void patchPayrollSettingsHandler(req, res);
  });

  return router;
};
