import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME } from '../constants/app';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import type { UserRole } from '../types';

const navItems: Array<{
  to: string;
  label: string;
  end?: boolean;
  disabled?: boolean;
  roles?: UserRole[];
}> = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/registrations', label: 'Registrations', roles: ['super_admin'] },
  { to: '/dashboard/employees', label: 'Employees', disabled: true },
  { to: '/dashboard/leave', label: 'Leave', disabled: true },
  { to: '/dashboard/documents', label: 'Documents', disabled: true },
  { to: '/dashboard/settings', label: 'Settings', disabled: true },
];

export function AppShell() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <span className="text-lg font-semibold text-brand-700">{APP_NAME}</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <span className="text-lg font-semibold text-brand-700 md:hidden">{APP_NAME}</span>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
