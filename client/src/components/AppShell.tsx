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

  icon: IconType;

  end?: boolean;

  disabled?: boolean;

  roles?: UserRole[];

}> = [

  { to: '/dashboard', label: 'Dashboard', icon: HiHome, end: true },

  { to: '/dashboard/registrations', label: 'Companies', icon: HiBuildingOffice2, roles: ['super_admin'] },

  {

    to: '/dashboard/platform/site-settings',

    label: 'Site settings',

    icon: HiCog6Tooth,

    roles: ['super_admin'],

  },

  { to: '/dashboard/employees', label: 'Employees', icon: HiUserGroup, roles: ['company_admin', 'hr_manager', 'manager'] },

  { to: '/dashboard/leave', label: 'Leave', icon: HiCalendarDays, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/attendance', label: 'Attendance', icon: HiClock, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/timesheets', label: 'Timesheets', icon: HiTableCells, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/rotas', label: 'Rotas', icon: HiBriefcase, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/expenses', label: 'Expenses', icon: HiCurrencyDollar, roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },

  { to: '/dashboard/payroll', label: 'Payroll', icon: HiCurrencyDollar, roles: ['company_admin', 'hr_manager'] },

  { to: '/dashboard/reports', label: 'Reports', icon: HiChartBar, roles: ['company_admin', 'hr_manager'] },

  { to: '/dashboard/documents', label: 'Documents', icon: HiDocumentText, roles: ['company_admin', 'hr_manager', 'employee'] },

  {

    to: '/dashboard/settings',

    label: 'Settings',

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



  const sidebarWidthClass = sidebarExpanded ? 'w-64' : 'w-16';

  const mainOffsetClass = sidebarExpanded ? 'md:left-64' : 'md:left-16';



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

        <nav className="thin-scrollbar min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-4">

          {navItems

            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))

            .map((item) => {

              const Icon = item.icon;



              if (item.disabled) {

                return (

                  <span

                    key={item.to}

                    title={item.label}

                    className={`flex items-center rounded-md py-2 text-sm text-slate-500 ${

                      sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-2'

                    }`}

                  >

                    <Icon className="h-5 w-5 shrink-0" aria-hidden />

                    {sidebarExpanded && (

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

                  title={sidebarExpanded ? undefined : item.label}

                  className={({ isActive }) =>

                    `flex items-center rounded-md py-2 text-sm transition ${

                      sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-2'

                    } ${

                      isActive

                        ? 'bg-[#122E44] font-semibold text-white'

                        : 'font-medium text-slate-400 hover:bg-[#122E44] hover:text-white'

                    }`

                  }

                >

                  <Icon className="h-5 w-5 shrink-0" aria-hidden />

                  {sidebarExpanded && <span className="truncate">{item.label}</span>}

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

            className={`flex w-full items-center rounded-md py-2 text-slate-400 transition hover:bg-[#122E44] hover:text-white ${

              sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-2'

            }`}

          >

            {sidebarExpanded ? (

              <>

                <HiChevronLeft className="h-5 w-5 shrink-0" aria-hidden />

                <span className="truncate text-sm font-medium">Collapse</span>

              </>

            ) : (

              <HiChevronRight className="h-5 w-5 shrink-0" aria-hidden />

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

