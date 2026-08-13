import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiArrowRightOnRectangle,
  HiChevronRight,
  HiClock,
  HiKey,
  HiMoon,
  HiPaintBrush,
  HiSun,
  HiUser,
} from 'react-icons/hi2';
import { ChangePasswordModal } from './ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMyAttendanceStatus } from '../hooks/useMyAttendanceStatus';
import { logout } from '../lib/api';
import type { ColorScheme, ThemeColor } from '../types';
import { THEME_COLOR_OPTIONS, THEME_COLORS } from '../utils/theme-colors';
import { UserAvatar } from './UserAvatar';
import { displayName } from '../utils/user';

type SubmenuKey = 'display' | 'theme';

const menuItemClass =
  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80';

const menuIconClass = 'h-5 w-5 shrink-0 text-slate-500 dark:text-slate-300';

const submenuPanelClass =
  'w-44 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl';

const submenuItemClass = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white transition-colors';

const submenuTriggerOpenClass = 'bg-slate-100 dark:bg-white/10';

const MenuRow = ({
  icon,
  label,
  chevron,
  onClick,
  to,
}: {
  icon: ReactNode;
  label: string;
  chevron?: boolean;
  onClick?: () => void;
  to?: string;
}) => {
  const content = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate leading-5">{label}</span>
      {chevron && <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />}
    </>
  );

  if (to) {
    return (
      <Link to={to} role="menuitem" className={menuItemClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" className={menuItemClass} onClick={onClick}>
      {content}
    </button>
  );
};

const HoverSubmenu = ({
  label,
  icon,
  submenuKey,
  activeSubmenu,
  onOpen,
  onClose,
  children,
}: {
  label: string;
  icon: ReactNode;
  submenuKey: SubmenuKey;
  activeSubmenu: SubmenuKey | null;
  onOpen: (key: SubmenuKey) => void;
  onClose: () => void;
  children: ReactNode;
}) => {
  const isOpen = activeSubmenu === submenuKey;

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen(submenuKey)}
      onMouseLeave={onClose}
    >
      <div
        role="menuitem"
        className={`${menuItemClass}${isOpen ? ` ${submenuTriggerOpenClass}` : ''}`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
        <span className="min-w-0 flex-1 truncate leading-5">{label}</span>
        <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />
      </div>

      {isOpen && (
        <div className="absolute right-full top-0 z-40 pr-2">
          <div role="menu" className={submenuPanelClass}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeColorOption = ({
  color,
  selected,
  onSelect,
}: {
  color: ThemeColor;
  selected: boolean;
  onSelect: () => void;
}) => {
  const swatch = THEME_COLORS[color].swatch;

  return (
    <button
      type="button"
      role="menuitem"
      className={`${submenuItemClass} border ${
        selected ? '' : 'border-transparent hover:border-white/20'
      }`}
      style={selected ? { borderColor: swatch } : undefined}
      onClick={onSelect}
    >
      <span
        className="h-4 w-4 shrink-0 rounded"
        style={{ backgroundColor: swatch }}
        aria-hidden
      />
      <span className="flex-1 text-left">{THEME_COLORS[color].label}</span>
    </button>
  );
};

const DisplayModeOption = ({
  label,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="menuitem"
    className={`${submenuItemClass} border ${
      selected ? 'border-brand-400' : 'border-transparent hover:border-white/20'
    }`}
    onClick={onSelect}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
  </button>
);

export const UserMenu = () => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { colorScheme, themeColor, setColorScheme, setThemeColor } = useTheme();
  const statusQuery = useMyAttendanceStatus();
  const clockedIn = statusQuery.data?.clockedIn ?? false;

  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuKey | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveSubmenu(null);
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  const closeMenu = () => {
    setOpen(false);
    setActiveSubmenu(null);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDisplayMode = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    closeMenu();
  };

  const handleThemeColor = (color: ThemeColor) => {
    setThemeColor(color);
    closeMenu();
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Account menu for ${displayName(user)}`}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/10"
          onClick={() => setOpen((prev) => !prev)}
        >
          {clockedIn && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/25">
              <HiClock className="h-3 w-3" aria-hidden />
              Clocked in
            </span>
          )}
          <UserAvatar user={user} variant="onBrand" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-56 overflow-visible rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div onClick={closeMenu}>
              <MenuRow
                to="/dashboard/profile"
                label="My profile"
                icon={<HiUser className={menuIconClass} aria-hidden />}
              />
            </div>

            <HoverSubmenu
              label="Display mode"
              icon={<HiSun className={menuIconClass} aria-hidden />}
              submenuKey="display"
              activeSubmenu={activeSubmenu}
              onOpen={setActiveSubmenu}
              onClose={() => setActiveSubmenu(null)}
            >
              <DisplayModeOption
                label="Light"
                icon={<HiSun className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />}
                selected={colorScheme === 'light'}
                onSelect={() => handleDisplayMode('light')}
              />
              <DisplayModeOption
                label="Dark"
                icon={<HiMoon className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />}
                selected={colorScheme === 'dark'}
                onSelect={() => handleDisplayMode('dark')}
              />
            </HoverSubmenu>

            <HoverSubmenu
              label="Theme color"
              icon={<HiPaintBrush className={menuIconClass} aria-hidden />}
              submenuKey="theme"
              activeSubmenu={activeSubmenu}
              onOpen={setActiveSubmenu}
              onClose={() => setActiveSubmenu(null)}
            >
              {THEME_COLOR_OPTIONS.map((color) => (
                <ThemeColorOption
                  key={color}
                  color={color}
                  selected={themeColor === color}
                  onSelect={() => handleThemeColor(color)}
                />
              ))}
            </HoverSubmenu>

            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                closeMenu();
                setPasswordModalOpen(true);
              }}
            >
              <HiKey className={menuIconClass} aria-hidden />
              <span className="min-w-0 flex-1 truncate leading-5">Change password</span>
            </button>

            <button type="button" role="menuitem" className={menuItemClass} onClick={() => void handleLogout()}>
              <HiArrowRightOnRectangle className={menuIconClass} aria-hidden />
              <span className="min-w-0 flex-1 truncate leading-5">Logout</span>
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
};
