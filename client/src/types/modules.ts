import type { IconType } from 'react-icons';
import {
  HiBriefcase,
  HiCalendarDays,
  HiChartBar,
  HiClock,
  HiCog6Tooth,
  HiCurrencyDollar,
  HiDocumentText,
  HiTableCells,
  HiUserGroup,
} from 'react-icons/hi2';

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

export interface TenantModuleMeta {
  id: TenantModuleId;
  label: string;
  description: string;
  icon: IconType;
}

export const TENANT_MODULE_META: TenantModuleMeta[] = [
  {
    id: 'employees',
    label: 'Employees',
    description: 'Employee directory, profiles, and org structure',
    icon: HiUserGroup,
  },
  {
    id: 'leave',
    label: 'Leave',
    description: 'Leave requests, balances, and approvals',
    icon: HiCalendarDays,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Clock in/out and attendance history',
    icon: HiClock,
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    description: 'Weekly hours and timesheet submission',
    icon: HiTableCells,
  },
  {
    id: 'rotas',
    label: 'Rotas',
    description: 'Shift schedules and open shifts',
    icon: HiBriefcase,
  },
  {
    id: 'expenses',
    label: 'Expenses',
    description: 'Expense claims and reimbursements',
    icon: HiCurrencyDollar,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    description: 'Payroll periods and export',
    icon: HiCurrencyDollar,
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Headcount and absence analytics',
    icon: HiChartBar,
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'HR document storage and sharing',
    icon: HiDocumentText,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Company profile, users, billing, and audit log',
    icon: HiCog6Tooth,
  },
];

export const getModuleLabel = (moduleId: TenantModuleId): string =>
  TENANT_MODULE_META.find((module) => module.id === moduleId)?.label ?? moduleId;

/** Platform shell — always on for every approved tenant; not toggled in Manage modules. */
export const ALWAYS_AVAILABLE_PLATFORM_FEATURES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
] as const;

export const getAlwaysAvailableFeatureLabels = (): string[] =>
  ALWAYS_AVAILABLE_PLATFORM_FEATURES.map((feature) => feature.label);
