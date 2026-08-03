export const ALL_TENANT_MODULE_IDS = [
  'employees',
  'leave',
  'attendance',
  'timesheets',
  'rotas',
  'expenses',
  'payroll',
  'reports',
  'documents',
  'settings',
] as const;

export type TenantModuleId = (typeof ALL_TENANT_MODULE_IDS)[number];

export const isTenantModuleId = (value: string): value is TenantModuleId =>
  (ALL_TENANT_MODULE_IDS as readonly string[]).includes(value);

export const resolveEnabledModules = (
  raw?: readonly string[] | null
): TenantModuleId[] => {
  if (raw === undefined || raw === null) {
    return [...ALL_TENANT_MODULE_IDS];
  }

  return raw.filter(isTenantModuleId);
};

export const normalizeEnabledModules = (modules: readonly string[]): TenantModuleId[] => {
  const unique = [...new Set(modules.filter(isTenantModuleId))];
  return unique;
};
