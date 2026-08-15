import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../../components/ui/navigation/NavTabBar";
import {
  SITE_SETTINGS_FAVICON_PATH,
  SITE_SETTINGS_GENERAL_PATH,
  SITE_SETTINGS_LOGO_PATH,
  SITE_SETTINGS_SIDEBAR_PATH,
} from "../utils";

const tabs = [
  { label: "GENERAL", path: SITE_SETTINGS_GENERAL_PATH },
  { label: "LOGO", path: SITE_SETTINGS_LOGO_PATH },
  { label: "FAVICON", path: SITE_SETTINGS_FAVICON_PATH },
  { label: "SIDEBAR", path: SITE_SETTINGS_SIDEBAR_PATH },
] as const;

export const SiteSettingsTabs = () => {
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
