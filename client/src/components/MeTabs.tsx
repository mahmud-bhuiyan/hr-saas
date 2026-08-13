import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { TenantModuleId } from "../types/modules";
import { isModuleEnabledForUser } from "../utils/modules";

const allTabs: Array<{
  label: string;
  path: string;
  module?: TenantModuleId;
}> = [
  { label: "ATTENDANCE", path: "/me/attendance", module: "attendance" },
  { label: "LEAVE", path: "/me/leave", module: "leave" },
  { label: "PERFORMANCE", path: "/me/performance" },
  { label: "EXPENSES & TRAVEL", path: "/me/expenses", module: "expenses" },
];

export const MeTabs = () => {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = allTabs.filter(
    (tab) => !tab.module || isModuleEnabledForUser(user, tab.module),
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="-mx-3 -mt-6 mb-6 flex h-14 items-center bg-[#0A1D2C] px-3 md:-mx-4 md:px-4">
      <nav className="flex h-full gap-6">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`relative flex h-full items-center px-1 text-[13px] font-semibold tracking-wide transition-colors ${
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -ml-2 border-[8px] border-transparent border-b-[#82b53a]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
