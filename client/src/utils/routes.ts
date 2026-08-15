import type { UserRole } from "../types";

export const TENANT_DASHBOARD_PATH = "/dashboard";

export const SUPER_ADMIN_BASE_PATH = "/super-admin";

export const SUPER_ADMIN_DASHBOARD_PATH = "/super-admin/dashboard";

export const homePathForRole = (role?: UserRole | null): string => {
  if (role === "super_admin") {
    return SUPER_ADMIN_DASHBOARD_PATH;
  }

  return TENANT_DASHBOARD_PATH;
};
