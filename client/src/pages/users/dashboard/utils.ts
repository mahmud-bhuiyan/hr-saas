import { isModuleEnabledForUser } from "../../../utils/modules";
import type { AuthUser, LeaveBalance } from "../../../types";
import { MY_DOCUMENTS_PATH, MY_LEAVE_PATH, MY_PROFILE_PATH } from "../utils";
import type { DashboardCard, DashboardLink } from "../../dashboard/utils";

const filterDashboardLinks = (
  links: DashboardLink[],
  user?: AuthUser | null,
): DashboardLink[] =>
  links.filter(
    (link) => !link.module || isModuleEnabledForUser(user, link.module),
  );

export const employeeCards = (
  companyName?: string,
  balance?: LeaveBalance,
): DashboardCard[] => [
  { label: "Company", value: companyName ?? "—", note: "Your organization" },
  {
    label: "Leave balance",
    value: balance != null ? balance.remaining : "—",
    note:
      balance != null
        ? `${balance.year} annual leave remaining`
        : "View on Leave page",
  },
  { label: "Documents", value: "—", note: "View on Documents page" },
  {
    label: "My requests",
    value: balance != null ? balance.pending : "—",
    note: "Pending approval",
  },
];

export const employeeLinks = (user?: AuthUser | null): DashboardLink[] =>
  filterDashboardLinks(
    [
      { label: "My profile", to: MY_PROFILE_PATH },
      { label: "Request leave", to: MY_LEAVE_PATH, module: "leave" },
      {
        label: "My documents",
        to: MY_DOCUMENTS_PATH,
        module: "documents",
      },
    ],
    user,
  );

export const employeeDashboardDescription =
  "Access your profile, leave, and documents in one place.";
