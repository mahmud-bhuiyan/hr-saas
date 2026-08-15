import { isModuleEnabledForUser } from "../../../utils/modules";
import { EMPLOYEES_ACTIVE_PATH } from "../../employees/utils";
import { MY_DOCUMENTS_PATH, MY_LEAVE_PATH } from "../../users/utils";
import { ADMIN_SETTINGS_PATH } from "../utils";
import type { AuthUser, Employee, UserRole } from "../../../types";
import type { DashboardCard, DashboardLink } from "../../dashboard/utils";

const filterDashboardLinks = (
  links: DashboardLink[],
  user?: AuthUser | null,
): DashboardLink[] =>
  links.filter(
    (link) => !link.module || isModuleEnabledForUser(user, link.module),
  );

const countByStatus = (
  employees: Employee[],
  status: Employee["status"],
): number => employees.filter((employee) => employee.status === status).length;

export const tenantAdminCards = (
  employees: Employee[],
  departments: string[],
  pendingLeave: number,
): DashboardCard[] => [
  { label: "Total employees", value: employees.length, note: "All records" },
  {
    label: "Active employees",
    value: countByStatus(employees, "active"),
    note: "Currently working",
  },
  { label: "Pending leave", value: pendingLeave, note: "Awaiting approval" },
  {
    label: "Departments",
    value: departments.length,
    note: "Unique departments",
  },
];

export const tenantAdminLinks = (
  canCreate: boolean,
  user?: AuthUser | null,
): DashboardLink[] =>
  filterDashboardLinks(
    [
      ...(canCreate
        ? [
            {
              label: "Add employee",
              to: EMPLOYEES_ACTIVE_PATH,
              module: "employees" as const,
            },
          ]
        : []),
      {
        label: "View employees",
        to: EMPLOYEES_ACTIVE_PATH,
        module: "employees",
      },
      { label: "Review leave requests", to: MY_LEAVE_PATH, module: "leave" },
      {
        label: "Company settings",
        to: ADMIN_SETTINGS_PATH,
        module: "settings",
      },
      {
        label: "Upload document",
        to: MY_DOCUMENTS_PATH,
        module: "documents",
      },
    ],
    user,
  );

export const managerLinks = (user?: AuthUser | null): DashboardLink[] =>
  filterDashboardLinks(
    [
      { label: "View team", to: EMPLOYEES_ACTIVE_PATH, module: "employees" },
      { label: "Review leave requests", to: MY_LEAVE_PATH, module: "leave" },
      { label: "Request leave", to: MY_LEAVE_PATH, module: "leave" },
    ],
    user,
  );

export const managerCards = (
  team: Employee[],
  pendingLeave: number,
): DashboardCard[] => {
  const departments = new Set(
    team.map((member) => member.department).filter(Boolean),
  );

  return [
    { label: "Direct reports", value: team.length, note: "Your team members" },
    {
      label: "Active team",
      value: countByStatus(team, "active"),
      note: "Currently working",
    },
    {
      label: "Pending leave",
      value: pendingLeave,
      note: "Team requests to review",
    },
    { label: "Departments", value: departments.size, note: "In your team" },
  ];
};

export const dashboardDescription = (role: UserRole): string => {
  switch (role) {
    case "company_admin":
      return "Manage your workforce, leave, and documents from one place.";
    case "hr_manager":
      return "Oversee employees, leave, and HR documents for your company.";
    case "manager":
      return "View your team and stay on top of pending approvals.";
    default:
      return "Your HR workspace is ready.";
  }
};
