import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../../../components/ui/navigation/NavTabBar";
import {
  COMPANY_SETTINGS_BRANDING_PATH,
  COMPANY_SETTINGS_PROFILE_PATH,
} from "../utils";

const tabs = [
  { label: "Company Profile", path: COMPANY_SETTINGS_PROFILE_PATH },
  { label: "Logo & Favicon", path: COMPANY_SETTINGS_BRANDING_PATH },
] as const;

export const CompanySettingsTabs = () => {
  const location = useLocation();

  const activeId =
    tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? "";

  return (
    <NavTabBar
      bleed
      tabs={tabs.map((tab) => ({
        id: tab.path,
        label: tab.label,
        to: tab.path,
      }))}
      activeId={activeId}
    />
  );
};
