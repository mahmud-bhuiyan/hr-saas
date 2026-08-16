import { ADMIN_SETTINGS_LOCATIONS_PATH } from "../../utils";

export const LOCATIONS_ACTIVE_PATH = `${ADMIN_SETTINGS_LOCATIONS_PATH}/active`;
export const LOCATIONS_ARCHIVED_PATH = `${ADMIN_SETTINGS_LOCATIONS_PATH}/archived`;

export type LocationsListVariant = "active" | "archived";

export const locationsListVariant = (
  pathname: string,
): LocationsListVariant | null => {
  if (pathname.startsWith(LOCATIONS_ARCHIVED_PATH)) {
    return "archived";
  }
  if (pathname.startsWith(LOCATIONS_ACTIVE_PATH)) {
    return "active";
  }
  return null;
};
