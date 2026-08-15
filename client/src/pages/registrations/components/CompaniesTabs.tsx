import { useLocation } from "react-router-dom";
import { NavTabBar } from "../../../components/ui/navigation/NavTabBar";
import { PENDING_COMPANIES_PATH, REGISTERED_COMPANIES_PATH } from "../utils";

const tabs = [
  { label: "REGISTERED COMPANIES", path: REGISTERED_COMPANIES_PATH },
  { label: "PENDING REGISTRATIONS", path: PENDING_COMPANIES_PATH },
] as const;

export const CompaniesTabs = () => {
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
