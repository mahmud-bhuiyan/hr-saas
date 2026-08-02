import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandMark } from './BrandMark';
import { SidebarUserBar } from './SidebarUserBar';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import type { UserRole } from '../types';

const navItems: Array<{
  to: string;
  label: string;
  end?: boolean;
  disabled?: boolean;
  roles?: UserRole[];
}> = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/registrations', label: 'Companies', roles: ['super_admin'] },
  {
    to: '/dashboard/platform/site-settings',
    label: 'Site settings',
    roles: ['super_admin'],
  },
  { to: '/dashboard/employees', label: 'Employees', roles: ['company_admin', 'hr_manager', 'manager'] },
  { to: '/dashboard/leave', label: 'Leave', roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },
  { to: '/dashboard/attendance', label: 'Attendance', roles: ['company_admin', 'hr_manager', 'manager', 'employee'] },
  { to: '/dashboard/documents', label: 'Documents', roles: ['company_admin', 'hr_manager', 'employee'] },
  {
    to: '/dashboard/settings',
    label: 'Settings',
    roles: ['company_admin', 'hr_manager'],
  },
];

export const AppShell = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <header className="fixed inset-x-0 top-0 z-20 flex border-b border-slate-200 bg-white">
        <div className="hidden h-14 w-64 shrink-0 items-center border-r border-slate-200 px-6 md:flex">
          <BrandMark />
        </div>
        <div className="flex h-14 min-w-0 flex-1 items-center justify-between px-4 md:px-6">
          <span className="md:hidden">
            <BrandMark />
          </span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-14 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <nav className="thin-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems
            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
            .map((item) =>
              item.disabled ? (
                <span
                  key={item.to}
                  className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-400"
                  title="Coming in a later step"
                >
                  {item.label}
                  <span className="ml-auto text-xs">Soon</span>
                </span>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
        </nav>
        <SidebarUserBar />
      </aside>

      <main className="thin-scrollbar fixed bottom-0 left-0 right-0 top-14 overflow-y-auto px-4 py-8 md:left-64 md:px-6">
        <Outlet />
      </main>
    </div>
  );
};
