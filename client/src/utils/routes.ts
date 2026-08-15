import type { UserRole } from "../types";
import { ADMIN_DASHBOARD_PATH } from "../pages/admin/utils";
import { MY_DASHBOARD_PATH } from "../pages/users/utils";

export const SUPER_ADMIN_BASE_PATH = "/super-admin";

export const SUPER_ADMIN_DASHBOARD_PATH = "/super-admin/dashboard";

const ADMIN_HOME_ROLES = new Set<UserRole>([
  "company_admin",
  "hr_manager",
  "manager",
]);

export const homePathForRole = (role?: UserRole | null): string => {
  if (role === "super_admin") {
    return SUPER_ADMIN_DASHBOARD_PATH;
  }

  if (role === "employee") {
    return MY_DASHBOARD_PATH;
  }

  if (role && ADMIN_HOME_ROLES.has(role)) {
    return ADMIN_DASHBOARD_PATH;
  }

  return ADMIN_DASHBOARD_PATH;
};
