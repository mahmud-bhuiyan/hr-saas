import {
  ADMIN_SETTINGS_COMPANY_BRANDING_PATH,
  ADMIN_SETTINGS_COMPANY_PROFILE_PATH,
} from "../../utils";

export type CompanySettingsTab = "profile" | "branding";

export const COMPANY_SETTINGS_PROFILE_PATH =
  ADMIN_SETTINGS_COMPANY_PROFILE_PATH;
export const COMPANY_SETTINGS_BRANDING_PATH =
  ADMIN_SETTINGS_COMPANY_BRANDING_PATH;

export const COMPANY_SETTINGS_TAB_PATHS: Record<CompanySettingsTab, string> = {
  profile: COMPANY_SETTINGS_PROFILE_PATH,
  branding: COMPANY_SETTINGS_BRANDING_PATH,
};

export const companySettingsTabFromPathname = (
  pathname: string,
): CompanySettingsTab | null => {
  if (pathname.startsWith(COMPANY_SETTINGS_BRANDING_PATH)) {
    return "branding";
  }
  if (pathname.startsWith(COMPANY_SETTINGS_PROFILE_PATH)) {
    return "profile";
  }
  return null;
};
