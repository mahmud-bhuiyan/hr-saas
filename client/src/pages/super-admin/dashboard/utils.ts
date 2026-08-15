import type { RegistrationRequest } from "../../../types";
import type { DashboardCard, DashboardLink } from "../../dashboard/utils";
import {
  REGISTERED_COMPANIES_PATH,
  PENDING_COMPANIES_PATH,
} from "../companies/utils";
import { COUNTRY_CODES_ACTIVE_PATH } from "../country-codes/utils";
import { SITE_SETTINGS_GENERAL_PATH } from "../site/utils";

export const SUPER_ADMIN_DASHBOARD_DESCRIPTION =
  "Review company registrations and manage tenants.";

export const superAdminCards = (
  pending: RegistrationRequest[],
  approved: RegistrationRequest[],
): DashboardCard[] => {
  const activeCompanies = approved.filter((company) => company.isActive).length;
  const inactiveCompanies = approved.length - activeCompanies;

  return [
    {
      label: "Pending registrations",
      value: pending.length,
      note: "Awaiting review",
    },
    {
      label: "Registered companies",
      value: approved.length,
      note: "Approved tenants",
    },
    {
      label: "Active companies",
      value: activeCompanies,
      note: "Currently enabled",
    },
    {
      label: "Inactive companies",
      value: inactiveCompanies,
      note: "Deactivated tenants",
    },
  ];
};

export const superAdminLinks = (): DashboardLink[] => [
  { label: "View registered companies", to: REGISTERED_COMPANIES_PATH },
  { label: "Review pending sign-ups", to: PENDING_COMPANIES_PATH },
  { label: "Site settings", to: SITE_SETTINGS_GENERAL_PATH },
  { label: "Country codes", to: COUNTRY_CODES_ACTIVE_PATH },
];
