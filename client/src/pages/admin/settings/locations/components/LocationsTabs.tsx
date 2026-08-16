import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../../../components/ui/navigation/NavTabBar";
import { LOCATIONS_ACTIVE_PATH, LOCATIONS_ARCHIVED_PATH } from "../utils";

const tabs = [
  { label: "ACTIVE", path: LOCATIONS_ACTIVE_PATH },
  { label: "ARCHIVED", path: LOCATIONS_ARCHIVED_PATH },
] as const;

export const LocationsTabs = () => {
  const location = useLocation();

  const activeId =
    tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? "";

  return (
    <NavTabBar
      bleed
      aria-label="Work locations sections"
      tabs={tabs.map((tab) => ({
        id: tab.path,
        label: tab.label,
        to: tab.path,
      }))}
      activeId={activeId}
    />
  );
};
