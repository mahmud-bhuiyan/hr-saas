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
