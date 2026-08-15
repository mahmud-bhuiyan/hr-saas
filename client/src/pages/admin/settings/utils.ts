import type { UserRole } from "../../../types";

export const roleLabel = (role: UserRole): string => {
  switch (role) {
    case "super_admin":
      return "Super admin";
    case "company_admin":
      return "Company admin";
    case "hr_manager":
      return "HR manager";
    case "manager":
      return "Manager";
    case "employee":
      return "Employee";
    default:
      return role;
  }
};

export const userDisplayName = (user: {
  firstName?: string;
  lastName?: string;
  email: string;
}): string => {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email;
};

export const assignableRoles: Array<Exclude<UserRole, "super_admin">> = [
  "company_admin",
  "hr_manager",
  "manager",
  "employee",
];
