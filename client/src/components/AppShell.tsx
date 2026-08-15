import { useEffect, useState } from "react";

import { matchPath, NavLink, Outlet, useLocation } from "react-router-dom";

import {
  HiBriefcase,
  HiBuildingOffice2,
  HiChartBar,
  HiChevronLeft,
  HiChevronRight,
  HiUser,
  HiCog6Tooth,
  HiCurrencyDollar,
  HiDocumentText,
  HiHome,
  HiPhone,
  HiTableCells,
  HiUserGroup,
} from "react-icons/hi2";

import type { IconType } from "react-icons";

import { useAuth } from "../contexts/AuthContext";

import { useHasLinkedEmployee } from "../hooks/useLinkedEmployee";

import { useSiteConfig } from "../contexts/SiteConfigContext";

import {
  loadSidebarExpanded,
  saveSidebarExpanded,
} from "../lib/sidebar-storage";

import { GlobalSearch } from "./layout/GlobalSearch";

import { BrandMark } from "./BrandMark";

import { UserMenu } from "./UserMenu";

import { NotificationBell } from "./NotificationBell";

import type { UserRole } from "../types";
import type { TenantModuleId } from "../types/modules";
import {
  hasAnyMeModuleEnabled,
  isModuleEnabledForUser,
} from "../utils/modules";

const navItems: Array<{
  to: string;

  label: string;

  icon: IconType;

  end?: boolean;

  /** Highlight when the current path starts with this prefix (e.g. /me/ sub-tabs). */
  activePrefix?: string;

  disabled?: boolean;

  roles?: UserRole[];

  module?: TenantModuleId;
}> = [
  { to: "/dashboard", label: "Home", icon: HiHome, end: true },

  {
    to: "/companies/registered",
    label: "Companies",
    icon: HiBuildingOffice2,
    roles: ["super_admin"],
    activePrefix: "/companies",
  },

  {
    to: "/dashboard/platform/site-settings",

    label: "Site settings",

    icon: HiCog6Tooth,

    roles: ["super_admin"],
  },

  {
    to: "/country-codes/active",
    label: "Country codes",
    icon: HiPhone,
    roles: ["super_admin"],
    activePrefix: "/country-codes",
  },

  {
    to: "/me/attendance",
    label: "Me",
    icon: HiUser,
    activePrefix: "/me/",
    roles: ["company_admin", "hr_manager", "manager", "employee"],
  },

  {
    to: "/employees/active",
    label: "My Team",
    icon: HiUserGroup,
    roles: ["company_admin", "hr_manager", "manager"],
    module: "employees",
    activePrefix: "/employees",
  },

  {
    to: "/dashboard/timesheets",
    label: "Timesheets",
    icon: HiTableCells,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "timesheets",
  },

  {
    to: "/dashboard/rotas",
    label: "Rotas",
    icon: HiBriefcase,
    roles: ["company_admin", "hr_manager", "manager", "employee"],
    module: "rotas",
  },

  {
    to: "/dashboard/payroll",
    label: "Payroll",
    icon: HiCurrencyDollar,
    roles: ["company_admin", "hr_manager"],
    module: "payroll",
  },

  {
    to: "/dashboard/reports",
    label: "Reports",
    icon: HiChartBar,
    roles: ["company_admin", "hr_manager"],
    module: "reports",
  },

  {
    to: "/dashboard/documents",
    label: "Documents",
    icon: HiDocumentText,
    roles: ["company_admin", "hr_manager", "employee"],
    module: "documents",
  },

  {
    to: "/dashboard/settings",

    label: "Settings",

    icon: HiCog6Tooth,

    roles: ["company_admin", "hr_manager"],

    module: "settings",
  },
];

const isNavItemActive = (
  pathname: string,
  item: (typeof navItems)[number],
): boolean => {
  if (item.activePrefix) {
    return pathname.startsWith(item.activePrefix);
  }

  return Boolean(
    matchPath({ path: item.to, end: item.end ?? false }, pathname),
  );
};

export const AppShell = () => {
  const { user } = useAuth();
  const hasLinkedEmployee = useHasLinkedEmployee();
  const { config } = useSiteConfig();
  const location = useLocation();

  const { sidebarDisplay } = config;
  const isCollapsible = sidebarDisplay.behavior === "collapsible";
  const collapsedWidthPx = sidebarDisplay.collapsedWidthPx;
  const expandedWidthPx = sidebarDisplay.expandedWidthPx;

  const [sidebarExpanded, setSidebarExpanded] = useState(() =>
    isCollapsible ? loadSidebarExpanded() : false,
  );

  const [isDesktopSidebar, setIsDesktopSidebar] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      setIsDesktopSidebar(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isCollapsible) {
      saveSidebarExpanded(sidebarExpanded);
    }
  }, [isCollapsible, sidebarExpanded]);

  useEffect(() => {
    if (!isCollapsible) {
      setSidebarExpanded(false);
    }
  }, [isCollapsible]);

  const isCompact = !isCollapsible || !sidebarExpanded;
  const activeWidthPx = isCompact ? collapsedWidthPx : expandedWidthPx;
  const sidebarWidthStyle = { width: activeWidthPx };
  const mainOffsetStyle = isDesktopSidebar
    ? { left: activeWidthPx }
    : undefined;

  const compactNavItemClass =
    "flex flex-col items-center gap-0.5 px-1 py-2 text-center text-[10px] leading-tight";

  const expandedNavItemClass =
    "flex flex-row items-center gap-3 px-3 py-2 text-sm";

  const navItemLayoutClass = isCompact
    ? compactNavItemClass
    : expandedNavItemClass;

  const iconClass = isCompact ? "h-[18px] w-[18px]" : "h-5 w-5";

  const toggleSidebar = () => {
    setSidebarExpanded((current) => !current);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="fixed inset-x-0 top-0 z-20 flex border-b border-brand-700 bg-brand-600 dark:border-brand-700 dark:bg-brand-700">
        <div
          className={`hidden h-14 shrink-0 items-center overflow-hidden border-r border-black/15 transition-[width] duration-200 md:flex ${
            isCompact ? "justify-center px-2" : "justify-start px-6"
          }`}
          style={sidebarWidthStyle}
        >
          <BrandMark
            compact={isCompact}
            textClassName="text-lg font-semibold text-white"
          />
        </div>

        <div className="flex h-14 min-w-0 flex-1 items-center gap-3 px-4 md:px-6">
          <span className="shrink-0 md:hidden">
            <BrandMark textClassName="text-lg font-semibold text-white" />
          </span>

          <div className="min-w-0 flex-1 md:max-w-2xl md:mx-auto">
            <GlobalSearch />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />

            <UserMenu />
          </div>
        </div>
      </header>

      <aside
        className="fixed bottom-0 left-0 top-14 z-10 hidden flex-col overflow-visible border-r border-white/10 bg-[#0A1D2C] transition-[width] duration-200 md:flex"
        style={sidebarWidthStyle}
      >
        <nav
          className={`thin-scrollbar min-h-0 flex-1 overflow-y-auto py-4 ${
            isCompact ? "space-y-1 px-1" : "space-y-0.5 px-2"
          }`}
        >
          {navItems

            .filter((item) => {
              if (item.roles && (!user || !item.roles.includes(user.role))) {
                return false;
              }

              if (item.module && !isModuleEnabledForUser(user, item.module)) {
                return false;
              }

              if (
                item.activePrefix === "/me/" &&
                !hasAnyMeModuleEnabled(user)
              ) {
                return false;
              }

              if (
                item.activePrefix === "/me/" &&
                user?.role === "company_admin" &&
                hasLinkedEmployee !== true
              ) {
                return false;
              }

              return true;
            })

            .map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <span
                    key={item.to}
                    title={item.label}
                    className={`rounded-md text-slate-500 ${navItemLayoutClass}`}
                  >
                    <Icon className={`${iconClass} shrink-0`} aria-hidden />

                    {isCompact ? (
                      <span className="max-w-full text-center text-[10px] font-medium leading-tight">
                        {item.label}
                      </span>
                    ) : (
                      <>
                        {item.label}
                        <span className="ml-auto text-xs">Soon</span>
                      </>
                    )}
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={() => {
                    const active = isNavItemActive(location.pathname, item);

                    return `rounded-md transition ${navItemLayoutClass} ${
                      active
                        ? "bg-[#122E44] font-semibold text-white"
                        : "font-medium text-slate-400 hover:bg-[#122E44] hover:text-white"
                    }`;
                  }}
                >
                  <Icon className={`${iconClass} shrink-0`} aria-hidden />

                  {isCompact ? (
                    <span className="max-w-full text-center font-medium leading-tight">
                      {item.label}
                    </span>
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {isCollapsible && (
          <div
            className={`shrink-0 border-t border-white/10 ${
              isCompact ? "px-2 py-2" : "px-3 py-2"
            }`}
          >
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={
                sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
              }
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              className={`flex w-full rounded-md text-slate-400 transition hover:bg-[#122E44] hover:text-white ${navItemLayoutClass}`}
            >
              {sidebarExpanded ? (
                <>
                  <HiChevronLeft
                    className={`${iconClass} shrink-0`}
                    aria-hidden
                  />
                  <span className="truncate font-medium">Collapse</span>
                </>
              ) : (
                <>
                  <HiChevronRight
                    className={`${iconClass} shrink-0`}
                    aria-hidden
                  />
                  <span className="max-w-full text-center font-medium leading-tight">
                    Expand
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      <main
        id="app-main"
        className="thin-scrollbar fixed bottom-0 left-0 right-0 top-14 overflow-y-auto px-3 pb-6 pt-0 transition-[left] duration-200 md:px-4"
        style={mainOffsetStyle}
      >
        <Outlet />
      </main>
    </div>
  );
};
