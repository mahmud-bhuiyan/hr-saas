import { useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle, HiUserCircle } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/api';
import { avatarLetter, displayName } from '../utils/user';
import { Dropdown } from './ui/Dropdown';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
        >
          <span className="hidden min-w-0 text-right sm:block">
            <span className="block text-sm font-medium leading-5 text-slate-900">
              {displayName(user)}
            </span>
            <span className="block max-w-[180px] truncate text-xs leading-4 text-slate-500">
              {user.email}
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
