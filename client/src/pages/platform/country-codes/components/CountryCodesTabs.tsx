import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../../components/ui/navigation/NavTabBar";
import {
  COUNTRY_CODES_ACTIVE_PATH,
  COUNTRY_CODES_ARCHIVED_PATH,
} from "../utils";

const tabs = [
  { label: "ACTIVE COUNTRY CODES", path: COUNTRY_CODES_ACTIVE_PATH },
  { label: "ARCHIVED COUNTRY CODES", path: COUNTRY_CODES_ARCHIVED_PATH },
] as const;

export const CountryCodesTabs = () => {
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
