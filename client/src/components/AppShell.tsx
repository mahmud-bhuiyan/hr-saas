import { useEffect, useState } from 'react';

import { NavLink, Outlet } from 'react-router-dom';

import {

  HiBriefcase,

  HiBuildingOffice2,

  HiCalendarDays,

  HiChartBar,

  HiChevronLeft,

  HiChevronRight,

  HiClock,

  HiCog6Tooth,

  HiCurrencyDollar,

  HiDocumentText,

  HiHome,

  HiTableCells,

  HiUserGroup,

} from 'react-icons/hi2';

import type { IconType } from 'react-icons';

import { useAuth } from '../contexts/AuthContext';

import { loadSidebarExpanded, saveSidebarExpanded } from '../lib/sidebar-storage';

import { GlobalSearch } from './GlobalSearch';

import { BrandMark } from './BrandMark';

import { SidebarUserBar } from './SidebarUserBar';

import { UserMenu } from './UserMenu';

import { NotificationBell } from './NotificationBell';

import type { UserRole } from '../types';



const navItems: Array<{

  to: string;

  label: string;

  shortLabel: string;

  icon: IconType;

  end?: boolean;

  disabled?: boolean;

  roles?: UserRole[];

}> = [

  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: HiHome, end: true },

  { to: '/dashboard/registrations', label: 'Companies', shortLabel: 'Cos', icon: HiBuildingOffice2, roles: ['super_admin'] },

  {

    to: '/dashboard/platform/site-settings',

    label: 'Site settings',

    shortLabel: 'Site',

    icon: HiCog6Tooth,

    roles: ['super_admin'],

  },

  { to: '/dashboard/employees', label: 'Employees', shortLabel: 'Team', icon: HiUserGroup, roles: ['company_admin', 'hr_manager', 'manager'] },

  { to: '/dashboard/leave', label: 'Leave', shortLabel: 'Leave', icon: HiCalendarDays, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/attendance', label: 'Attendance', shortLabel: 'Attend', icon: HiClock, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/timesheets', label: 'Timesheets', shortLabel: 'Times', icon: HiTableCells, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/rotas', label: 'Rotas', shortLabel: 'Rotas', icon: HiBriefcase, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/expenses', label: 'Expenses', shortLabel: 'Expense', icon: HiCurrencyDollar, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/payroll', label: 'Payroll', shortLabel: 'Payroll', icon: HiCurrencyDollar, roles: ['company_admin', 'hr_manager'] },

  { to: '/dashboard/reports', label: 'Reports', shortLabel: 'Reports', icon: HiChartBar, roles: ['company_admin', 'hr_manager'] },

  { to: '/dashboard/documents', label: 'Documents', shortLabel: 'Docs', icon: HiDocumentText, roles: ['company_admin', 'hr_manager', 'employee'] },

  {

    to: '/dashboard/settings',

    label: 'Settings',

    shortLabel: 'Settings',

    icon: HiCog6Tooth,

    roles: ['company_admin', 'hr_manager'],

  },

];



export const AppShell = () => {

  const { user } = useAuth();

  const [sidebarExpanded, setSidebarExpanded] = useState(loadSidebarExpanded);



  useEffect(() => {

    saveSidebarExpanded(sidebarExpanded);

  }, [sidebarExpanded]);



  const sidebarWidthClass = sidebarExpanded ? 'w-64' : 'w-20';

  const mainOffsetClass = sidebarExpanded ? 'md:left-64' : 'md:left-20';

  const navItemLayoutClass = sidebarExpanded

    ? 'flex-row items-center gap-3 px-3 py-2'

    : 'flex-col items-center gap-0.5 px-1 py-2 text-center';



  const toggleSidebar = () => {

    setSidebarExpanded((current) => !current);

  };



  return (

    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      <header className="fixed inset-x-0 top-0 z-20 flex border-b border-brand-700 bg-brand-600 dark:border-brand-700 dark:bg-brand-700">

        <div

          className={`hidden h-14 shrink-0 items-center overflow-hidden border-r border-black/15 transition-[width] duration-200 md:flex ${sidebarWidthClass} ${
            sidebarExpanded ? 'justify-start px-6' : 'justify-center px-2'
          }`}

        >

          <BrandMark compact={!sidebarExpanded} textClassName="text-lg font-semibold text-white" />

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

        className={`fixed bottom-0 left-0 top-14 z-10 hidden flex-col overflow-visible border-r border-white/10 bg-[#0A1D2C] transition-[width] duration-200 md:flex ${sidebarWidthClass}`}

      >

        <nav className={`thin-scrollbar min-h-0 flex-1 overflow-y-auto py-4 ${sidebarExpanded ? 'space-y-0.5 px-2' : 'space-y-1 px-1'}`}>

          {navItems

            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))

            .map((item) => {

              const Icon = item.icon;



              if (item.disabled) {

                return (

                  <span

                    key={item.to}

                    title={item.label}

                    className={`flex rounded-md text-slate-500 ${navItemLayoutClass} ${sidebarExpanded ? 'text-sm' : 'text-[10px] leading-tight'}`}

                  >

                    <Icon className={`shrink-0 ${sidebarExpanded ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`} aria-hidden />

                    {sidebarExpanded ? (

                      <>

                        {item.label}

                        <span className="ml-auto text-xs">Soon</span>

                      </>

                    ) : (

                      <span className="max-w-full truncate font-medium">{item.shortLabel}</span>

                    )}

                  </span>

                );

              }



              return (

                <NavLink

                  key={item.to}

                  to={item.to}

                  end={item.end}

                  className={({ isActive }) =>

                    `flex rounded-md transition ${navItemLayoutClass} ${sidebarExpanded ? 'text-sm' : 'text-[10px] leading-tight'} ${

                      isActive

                        ? 'bg-[#122E44] font-semibold text-white'

                        : 'font-medium text-slate-400 hover:bg-[#122E44] hover:text-white'

                    }`

                  }

                >

                  <Icon className={`shrink-0 ${sidebarExpanded ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`} aria-hidden />

                  {sidebarExpanded ? (

                    <span className="truncate">{item.label}</span>

                  ) : (

                    <span className="max-w-full truncate">{item.shortLabel}</span>

                  )}

                </NavLink>

              );

            })}

        </nav>



        <div className={`shrink-0 border-t border-white/10 ${sidebarExpanded ? 'px-3 py-2' : 'px-2 py-2'}`}>

          <button

            type="button"

            onClick={toggleSidebar}

            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}

            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}

            className={`flex w-full rounded-md text-slate-400 transition hover:bg-[#122E44] hover:text-white ${

              sidebarExpanded ? 'flex-row items-center gap-3 px-3 py-2' : 'flex-col items-center gap-0.5 px-1 py-2 text-center'

            }`}

          >

            {sidebarExpanded ? (

              <>

                <HiChevronLeft className="h-5 w-5 shrink-0" aria-hidden />

                <span className="truncate text-sm font-medium">Collapse</span>

              </>

            ) : (

              <>

                <HiChevronRight className="h-[18px] w-[18px] shrink-0" aria-hidden />

                <span className="max-w-full truncate text-[10px] font-medium leading-tight">Expand</span>

              </>

            )}

          </button>

        </div>



        <SidebarUserBar expanded={sidebarExpanded} />

      </aside>



      <main

        className={`thin-scrollbar fixed bottom-0 left-0 right-0 top-14 overflow-y-auto px-3 py-6 transition-[left] duration-200 md:px-4 ${mainOffsetClass}`}

      >

        <Outlet />

      </main>

    </div>

  );

};

