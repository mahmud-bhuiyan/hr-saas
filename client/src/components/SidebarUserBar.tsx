import { useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/api';
import { avatarLetter, displayName } from '../utils/user';

export const SidebarUserBar = () => {
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
    <div className="shrink-0 border-t border-slate-200 px-3 py-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {avatarLetter(user)}
        </span>
        <div className="group/user-info relative min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-5 text-slate-900">{displayName(user)}</p>
          <p className="truncate text-xs leading-4 text-slate-500">{user.email}</p>
          <div
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md group-hover/user-info:block"
          >
            <p className="whitespace-nowrap text-sm font-medium text-slate-900">{displayName(user)}</p>
            <p className="whitespace-nowrap text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          title="Log out"
          aria-label="Log out"
          className="flex shrink-0 items-center rounded-lg p-2 text-red-600 transition hover:bg-red-50"
        >
          <HiArrowRightOnRectangle className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
