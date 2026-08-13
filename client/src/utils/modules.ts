import type { AuthUser } from '../types';
import {
  ALL_TENANT_MODULE_IDS,
  resolveEnabledModules,
  type TenantModuleId,
} from '../types/modules';

export const getUserEnabledModules = (user: AuthUser | null | undefined): TenantModuleId[] => {
  if (!user || user.role === 'super_admin') {
    return [...ALL_TENANT_MODULE_IDS];
  }

  return resolveEnabledModules(user.enabledModules);
};

export const isModuleEnabledForUser = (
  user: AuthUser | null | undefined,
  moduleId: TenantModuleId
): boolean => getUserEnabledModules(user).includes(moduleId);

export const ME_MODULE_IDS = ['attendance', 'leave', 'expenses'] as const satisfies readonly TenantModuleId[];

export const hasAnyMeModuleEnabled = (user: AuthUser | null | undefined): boolean =>
  ME_MODULE_IDS.some((moduleId) => isModuleEnabledForUser(user, moduleId));
