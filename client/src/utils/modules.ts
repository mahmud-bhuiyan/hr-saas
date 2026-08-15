import type { AuthUser } from "../types";
import {
  ALL_TENANT_MODULE_IDS,
  resolveEnabledModules,
  type TenantModuleId,
} from "../types/modules";

export const getUserEnabledModules = (
  user: AuthUser | null | undefined,
): TenantModuleId[] => {
  if (!user || user.role === "super_admin") {
    return [...ALL_TENANT_MODULE_IDS];
  }

  return resolveEnabledModules(user.enabledModules);
};

export const isModuleEnabledForUser = (
  user: AuthUser | null | undefined,
  moduleId: TenantModuleId,
): boolean => getUserEnabledModules(user).includes(moduleId);

const TENANT_MY_MODULE_IDS = [
  "attendance",
  "leave",
  "expenses",
] as const satisfies readonly TenantModuleId[];

const EMPLOYEE_MY_MODULE_IDS = [
  "attendance",
  "leave",
  "expenses",
  "timesheets",
  "rotas",
  "documents",
] as const satisfies readonly TenantModuleId[];

export const hasAnyMyModuleEnabled = (
  user: AuthUser | null | undefined,
): boolean => {
  const moduleIds =
    user?.role === "employee" ? EMPLOYEE_MY_MODULE_IDS : TENANT_MY_MODULE_IDS;

  return moduleIds.some((moduleId) => isModuleEnabledForUser(user, moduleId));
};
