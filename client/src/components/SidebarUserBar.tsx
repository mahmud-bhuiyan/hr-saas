import { useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle, HiEnvelope, HiShieldCheck } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/api';
import { avatarLetter, displayName, roleLabel } from '../utils/user';

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
    <div className="shrink-0 border-t border-slate-200 px-3 py-3 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {avatarLetter(user)}
        </span>
        <div className="group/user-info relative min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-5 text-slate-900 dark:text-slate-100">{displayName(user)}</p>
          <p className="truncate text-xs leading-4 text-slate-500 dark:text-slate-400">{user.email}</p>
          <p className="mt-0.5 truncate text-xs capitalize leading-4 text-brand-600">{roleLabel(user.role)}</p>
          <div
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden min-w-[12rem] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md group-hover/user-info:block dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{displayName(user)}</p>
            <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
              <HiEnvelope className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
              {user.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs capitalize text-brand-600">
              <HiShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
              {roleLabel(user.role)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          title="Log out"
          aria-label="Log out"
          className="flex shrink-0 items-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <HiArrowRightOnRectangle className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
