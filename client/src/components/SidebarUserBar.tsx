import { useNavigate } from 'react-router-dom';
import {
  HiArrowRightOnRectangle,
  HiEnvelope,
  HiShieldCheck,
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/api';
import { UserAvatar } from './UserAvatar';
import { displayName, roleLabel } from '../utils/user';
import type { AuthUser } from '../types';

type SidebarUserBarProps = {
  expanded: boolean;
};

const UserInfoTooltip = ({
  user,
  placement,
}: {
  user: AuthUser;
  placement: 'right' | 'above';
}) => (
  <div
    role="tooltip"
    className={`pointer-events-none absolute z-[100] hidden min-w-[12rem] rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-xl group-hover/user-info:block ${
      placement === 'right'
        ? 'left-full bottom-0 ml-2'
        : 'bottom-full left-0 mb-2'
    }`}
  >
    <p className="whitespace-nowrap text-sm font-medium text-slate-900">
      {displayName(user)}
    </p>
    <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
      <HiEnvelope className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
      {user.email}
    </p>
    <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs capitalize text-brand-700">
      <HiShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
      {roleLabel(user.role)}
    </p>
  </div>
);

export const SidebarUserBar = ({ expanded }: SidebarUserBarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!expanded) {
    return (
      <div className="shrink-0 overflow-visible border-t border-white/10 px-2 py-3">
        <div className="group/user-info relative flex w-full justify-center">
          <UserAvatar user={user} variant="onBrand" />
          <UserInfoTooltip user={user} placement="right" />
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-white/10 px-3 py-3">
      <div className="flex items-center gap-2">
        <UserAvatar user={user} variant="onBrand" />
        <div className="group/user-info relative min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-5 text-white">
            {displayName(user)}
          </p>
          <p className="mt-0.5 truncate text-xs capitalize leading-4 text-brand-300">
            {roleLabel(user.role)}
          </p>
          <UserInfoTooltip user={user} placement="above" />
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          title="Log out"
          aria-label="Log out"
          className="flex shrink-0 items-center rounded-md p-2 text-slate-400 transition hover:bg-[#122E44] hover:text-red-400"
        >
          <HiArrowRightOnRectangle className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};
