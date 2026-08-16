import { ADMIN_SETTINGS_DEPARTMENTS_PATH } from "../../utils";

export const DEPARTMENTS_ACTIVE_PATH = `${ADMIN_SETTINGS_DEPARTMENTS_PATH}/active`;
export const DEPARTMENTS_ARCHIVED_PATH = `${ADMIN_SETTINGS_DEPARTMENTS_PATH}/archived`;

export type DepartmentsListVariant = "active" | "archived";

export const departmentsListVariant = (
  pathname: string,
): DepartmentsListVariant | null => {
  if (pathname.startsWith(DEPARTMENTS_ARCHIVED_PATH)) {
    return "archived";
  }
  if (pathname.startsWith(DEPARTMENTS_ACTIVE_PATH)) {
    return "active";
  }
  return null;
};
