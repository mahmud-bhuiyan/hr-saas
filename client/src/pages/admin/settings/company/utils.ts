export type CompanySettingsTab = "profile" | "branding";

export const COMPANY_SETTINGS_TAB_IDS = [
  "profile",
  "branding",
] as const satisfies readonly CompanySettingsTab[];
