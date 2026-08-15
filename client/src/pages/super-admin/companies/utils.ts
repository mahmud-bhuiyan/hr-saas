import type { RegistrationRequest } from "../../../types";

export const adminDisplayName = (
  firstName?: string,
  lastName?: string,
): string => {
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(" ");
  }
  return "—";
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleString();
};

export const toEditForm = (row: RegistrationRequest): EditCompanyForm => {
  return {
    companyName: row.companyName,
    adminEmail: row.adminEmail,
    adminFirstName: row.adminFirstName ?? "",
    adminLastName: row.adminLastName ?? "",
    isActive: row.isActive,
  };
};

export const matchesCompanySearch = (
  row: RegistrationRequest,
  query: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    row.companyName,
    row.adminEmail,
    row.adminFirstName,
    row.adminLastName,
    adminDisplayName(row.adminFirstName, row.adminLastName),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
};

export type EditCompanyForm = {
  companyName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  isActive: boolean;
};

export const editFormKeys: Array<keyof EditCompanyForm> = [
  "companyName",
  "adminEmail",
  "adminFirstName",
  "adminLastName",
  "isActive",
];

export const COMPANIES_BASE_PATH = "/super-admin/companies";
export const REGISTERED_COMPANIES_PATH = "/super-admin/companies/registered";
export const PENDING_COMPANIES_PATH = "/super-admin/companies/pending";

export type CompaniesListVariant = "registered" | "pending";

export const emptyCreateForm = {
  companyName: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};
