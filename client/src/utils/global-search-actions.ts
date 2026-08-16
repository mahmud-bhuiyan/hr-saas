import type { AuthUser, UserRole } from "../types";
import type { TenantModuleId } from "../types/modules";
import { EMPLOYEES_ACTIVE_PATH } from "../pages/employees/utils";
import {
  MY_ATTENDANCE_PATH,
  MY_DOCUMENTS_PATH,
  MY_DASHBOARD_PATH,
  MY_LEAVE_PATH,
  MY_PROFILE_PATH,
  MY_ROTAS_PATH,
  MY_TIMESHEETS_PATH,
} from "../pages/users/utils";
import { REGISTERED_COMPANIES_PATH } from "../pages/super-admin/companies/utils";
import { COUNTRY_CODES_ACTIVE_PATH } from "../pages/super-admin/country-codes/utils";
import { SITE_SETTINGS_GENERAL_PATH } from "../pages/super-admin/site/utils";
import { isModuleEnabledForUser } from "./modules";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PAYROLL_PATH,
  ADMIN_REPORTS_PATH,
  ADMIN_SETTINGS_PATH,
} from "../pages/admin/utils";
import { SUPER_ADMIN_DASHBOARD_PATH } from "./routes";

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
    id: "admin-dashboard",
    label: "Dashboard",
    subtitle: "Home overview",
    route: ADMIN_DASHBOARD_PATH,
    roles: ["company_admin", "hr_manager", "manager"],
    keywords: ["home", "overview"],
  },
  {
    id: "employee-dashboard",
    label: "Dashboard",
    subtitle: "Home overview",
    route: MY_DASHBOARD_PATH,
    roles: ["employee"],
    keywords: ["home", "overview"],
  },
  {
    id: "super-admin-dashboard",
    label: "Dashboard",
    subtitle: "Platform overview",
    route: SUPER_ADMIN_DASHBOARD_PATH,
    roles: ["super_admin"],
    keywords: ["home", "overview", "platform"],
  },
  {
    id: "profile",
    label: "My profile",
    subtitle: "View and edit your account",
    route: MY_PROFILE_PATH,
    roles: [
      "company_admin",
      "hr_manager",
      "manager",
      "employee",
      "super_admin",
    ],
    keywords: ["profile", "account", "password"],
  },
  {
    id: "leave",
    label: "Leave",
    subtitle: "Leave requests, balances, and time off",
    route: MY_LEAVE_PATH,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "leave",
    keywords: [
      "leave",
      "apply leave",
      "leave request",
      "time off",
      "vacation",
      "holiday",
      "absence",
      "balances",
    ],
  },
  {
    id: "attendance",
    label: "Clock in / attendance",
    subtitle: "Clock in, clock out, and history",
    route: MY_ATTENDANCE_PATH,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "attendance",
    keywords: ["clock in", "clock out", "attendance", "punch", "time"],
  },
  {
    id: "timesheets",
    label: "My timesheet",
    subtitle: "Weekly hours and submission",
    route: MY_TIMESHEETS_PATH,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "timesheets",
    keywords: ["timesheet", "hours", "overtime", "weekly"],
  },
  {
    id: "employees",
    label: "Employees",
    subtitle: "Employee directory",
    route: EMPLOYEES_ACTIVE_PATH,
    roles: ["company_admin", "hr_manager", "manager"],
    module: "employees",
    keywords: ["employees", "directory", "staff", "team", "people"],
  },
  {
    id: "documents",
    label: "Documents",
    subtitle: "HR documents and files",
    route: MY_DOCUMENTS_PATH,
    roles: ["company_admin", "hr_manager", "employee"],
    module: "documents",
    keywords: ["documents", "files", "contracts", "upload"],
  },
  {
    id: "rotas",
    label: "Rotas",
    subtitle: "Shift schedule and open shifts",
    route: MY_ROTAS_PATH,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "rotas",
    keywords: ["rota", "rotas", "shift", "schedule", "shifts"],
  },
  {
    id: "payroll",
    label: "Payroll",
    subtitle: "Payroll periods and export",
    route: ADMIN_PAYROLL_PATH,
    roles: ["company_admin", "hr_manager"],
    module: "payroll",
    keywords: ["payroll", "pay", "salary", "export"],
  },
  {
    id: "reports",
    label: "Reports",
    subtitle: "Headcount and absence reports",
    route: ADMIN_REPORTS_PATH,
    roles: ["company_admin", "hr_manager"],
    module: "reports",
    keywords: ["reports", "headcount", "analytics", "absence"],
  },
  {
    id: "settings",
    label: "Settings",
    subtitle: "Company and HR settings",
    route: ADMIN_SETTINGS_PATH,
    roles: ["company_admin", "hr_manager"],
    module: "settings",
    keywords: ["settings", "company", "departments", "users", "configuration"],
  },
  {
    id: "registrations",
    label: "Companies",
    subtitle: "Pending and registered tenants",
    route: REGISTERED_COMPANIES_PATH,
    roles: ["super_admin"],
    keywords: ["companies", "registrations", "tenants", "approve"],
  },
  {
    id: "site-settings",
    label: "Site settings",
    subtitle: "Global branding and theme",
    route: SITE_SETTINGS_GENERAL_PATH,
    roles: ["super_admin"],
    keywords: ["site", "branding", "logo", "favicon"],
  },
  {
    id: "country-codes",
    label: "Country codes",
    subtitle: "Manage global phone dial codes",
    route: COUNTRY_CODES_ACTIVE_PATH,
    roles: ["super_admin"],
    keywords: ["country", "dial", "phone", "codes"],
  },
];

const actionMatchesQuery = (
  action: GlobalSearchActionDef,
  normalizedQuery: string,
): boolean => {
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

export const getActionsForRole = (
  role: UserRole,
  user?: AuthUser | null,
): GlobalSearchActionDef[] =>
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
  limit = 8,
): GlobalSearchActionDef[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const allowed = getActionsForRole(role, user);

  return allowed
    .filter((action) => actionMatchesQuery(action, normalizedQuery))
    .slice(0, limit);
};
