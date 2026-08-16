import type { AuthUser, UserRole } from "../types";

export const displayName = (user: AuthUser): string => {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email.split("@")[0] ?? "User";
};

export const avatarLetter = (user: AuthUser): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName[0]!.toUpperCase();
  }
  return (user.email[0] ?? "U").toUpperCase();
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super admin",
  company_admin: "Company admin",
  hr_manager: "HR manager",
  manager: "Manager",
  employee: "Employee",
};

export const roleLabel = (role: UserRole | string): string => {
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as UserRole];
  }
  return role.replace(/_/g, " ");
};
