import { useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle, HiClock, HiUserCircle } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { useMyAttendanceStatus } from '../hooks/useMyAttendanceStatus';
import { logout } from '../lib/api';
import { avatarLetter, displayName, roleLabel } from '../utils/user';
import { Dropdown } from './ui/Dropdown';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const statusQuery = useMyAttendanceStatus();
  const clockedIn = statusQuery.data?.clockedIn ?? false;

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {clockedIn && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <HiClock className="h-3 w-3" aria-hidden />
              Clocked in
            </span>
          )}
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-medium leading-5 text-slate-900 dark:text-slate-100">
              {displayName(user)}
            </span>
            <span className="block text-xs capitalize leading-4 text-brand-600">
              {roleLabel(user.role)}
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {avatarLetter(user)}
          </span>
        </button>
      }
      items={[
        {
          key: 'profile',
          label: 'Profile',
          to: '/dashboard/profile',
          icon: <HiUserCircle className="h-5 w-5 text-brand-600" aria-hidden />,
        },
        {
          key: 'logout',
          label: 'Log out',
          icon: <HiArrowRightOnRectangle className="h-5 w-5 text-red-500" aria-hidden />,
          onClick: () => void handleLogout(),
        },
      ]}
    />
  );
}
