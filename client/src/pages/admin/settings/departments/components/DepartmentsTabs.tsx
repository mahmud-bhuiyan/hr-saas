import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../../../components/ui/navigation/NavTabBar";
import { DEPARTMENTS_ACTIVE_PATH, DEPARTMENTS_ARCHIVED_PATH } from "../utils";

const tabs = [
  { label: "ACTIVE", path: DEPARTMENTS_ACTIVE_PATH },
  { label: "ARCHIVED", path: DEPARTMENTS_ARCHIVED_PATH },
] as const;

export const DepartmentsTabs = () => {
  const location = useLocation();

  const activeId =
    tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? "";

  return (
    <NavTabBar
      bleed
      aria-label="Departments sections"
      tabs={tabs.map((tab) => ({
        id: tab.path,
        label: tab.label,
        to: tab.path,
      }))}
      activeId={activeId}
    />
  );
};
