import type { AuthUser, UserRole } from '../types';
import type { TenantModuleId } from '../types/modules';
import { EMPLOYEES_ACTIVE_PATH } from '../pages/employees/utils';
import { isModuleEnabledForUser } from './modules';

export type GlobalSearchActionDef = {
  id: string;
  label: string;
  subtitle?: string;
  route: string;
  roles?: UserRole[];
  module?: TenantModuleId;
  keywords: string[];
};

export const GLOBAL_SEARCH_ACTIONS: GlobalSearchActionDef[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    subtitle: 'Home overview',
    route: '/dashboard',
    keywords: ['home', 'overview'],
  },
  {
    id: 'profile',
    label: 'My profile',
    subtitle: 'View and edit your account',
    route: '/dashboard/profile',
    keywords: ['profile', 'account', 'password'],
  },
  {
    id: 'leave',
    label: 'Leave',
    subtitle: 'Leave requests, balances, and time off',
    route: '/me/leave',
    roles: ['company_admin', 'hr_manager', 'manager', 'employee'],
    module: 'leave',
    keywords: ['leave', 'apply leave', 'leave request', 'time off', 'vacation', 'holiday', 'absence', 'balances'],
  },
  {
    id: 'attendance',
    label: 'Clock in / attendance',
    subtitle: 'Clock in, clock out, and history',
    route: '/me/attendance',
    roles: ['company_admin', 'hr_manager', 'manager', 'employee'],
    module: 'attendance',
    keywords: ['clock in', 'clock out', 'attendance', 'punch', 'time'],
  },
  {
    id: 'timesheets',
    label: 'My timesheet',
    subtitle: 'Weekly hours and submission',
    route: '/dashboard/timesheets',
    roles: ['company_admin', 'hr_manager', 'manager', 'employee'],
    module: 'timesheets',
    keywords: ['timesheet', 'hours', 'overtime', 'weekly'],
  },
  {
    id: 'expenses',
    label: 'Submit expense',
    subtitle: 'Expense claims and receipts',
    route: '/me/expenses',
    roles: ['company_admin', 'hr_manager', 'manager', 'employee'],
    module: 'expenses',
    keywords: ['expense', 'receipt', 'reimbursement', 'claim'],
  },
  {
    id: 'employees',
    label: 'Employees',
    subtitle: 'Employee directory',
    route: EMPLOYEES_ACTIVE_PATH,
    roles: ['company_admin', 'hr_manager', 'manager'],
    module: 'employees',
    keywords: ['employees', 'directory', 'staff', 'team', 'people'],
  },
  {
    id: 'documents',
    label: 'Documents',
    subtitle: 'HR documents and files',
    route: '/dashboard/documents',
    roles: ['company_admin', 'hr_manager', 'employee'],
    module: 'documents',
    keywords: ['documents', 'files', 'contracts', 'upload'],
  },
  {
    id: 'rotas',
    label: 'Rotas',
    subtitle: 'Shift schedule and open shifts',
    route: '/dashboard/rotas',
    roles: ['company_admin', 'hr_manager', 'manager', 'employee'],
    module: 'rotas',
    keywords: ['rota', 'rotas', 'shift', 'schedule', 'shifts'],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    subtitle: 'Payroll periods and export',
    route: '/dashboard/payroll',
    roles: ['company_admin', 'hr_manager'],
    module: 'payroll',
    keywords: ['payroll', 'pay', 'salary', 'export'],
  },
  {
    id: 'reports',
    label: 'Reports',
    subtitle: 'Headcount and absence reports',
    route: '/dashboard/reports',
    roles: ['company_admin', 'hr_manager'],
    module: 'reports',
    keywords: ['reports', 'headcount', 'analytics', 'absence'],
  },
  {
    id: 'settings',
    label: 'Settings',
    subtitle: 'Company and HR settings',
    route: '/dashboard/settings',
    roles: ['company_admin', 'hr_manager'],
    module: 'settings',
    keywords: ['settings', 'company', 'departments', 'users', 'configuration'],
  },
  {
    id: 'registrations',
    label: 'Companies',
    subtitle: 'Pending and registered tenants',
    route: '/dashboard/registrations',
    roles: ['super_admin'],
    keywords: ['companies', 'registrations', 'tenants', 'approve'],
  },
  {
    id: 'site-settings',
    label: 'Platform site settings',
    subtitle: 'Global branding and theme',
    route: '/dashboard/platform/site-settings',
    roles: ['super_admin'],
    keywords: ['platform', 'site', 'branding', 'logo', 'favicon'],
  },
];

const actionMatchesQuery = (action: GlobalSearchActionDef, normalizedQuery: string): boolean => {
  if (!normalizedQuery) {
    return true;
  }

  if (action.label.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  if (action.subtitle?.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  return action.keywords.some((keyword) => keyword.includes(normalizedQuery));
};

export const getActionsForRole = (role: UserRole, user?: AuthUser | null): GlobalSearchActionDef[] =>
  GLOBAL_SEARCH_ACTIONS.filter((action) => {
    if (action.roles && !action.roles.includes(role)) {
      return false;
    }

    if (action.module && user && !isModuleEnabledForUser(user, action.module)) {
      return false;
    }

    return true;
  });

export const filterGlobalSearchActions = (
  query: string,
  role: UserRole,
  user?: AuthUser | null,
  limit = 8
): GlobalSearchActionDef[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const allowed = getActionsForRole(role, user);

  return allowed.filter((action) => actionMatchesQuery(action, normalizedQuery)).slice(0, limit);
};
