import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  to?: string;
  href?: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  menuClassName?: string;
}

export const Dropdown = ({ trigger, items, align = 'right', menuClassName = 'w-44' }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
  }

  const renderItemContent = (item: DropdownItem) => {
    return (
      <>
        {item.icon && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
        )}
        <span className="leading-5">{item.label}</span>
      </>
    );
  }

  const itemClassName = (item: DropdownItem) =>
    `flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 ${
      item.variant === 'danger' ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'
    }`;

  return (
    <div ref={menuRef} className="relative">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>

      {open && (
        <div
          role="menu"
          className={`absolute z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {items.map((item) => {
            if (item.to) {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  role="menuitem"
                  className={itemClassName(item)}
                  onClick={closeMenu}
                >
                  {renderItemContent(item)}
                </Link>
              );
            }

            if (item.href) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  role="menuitem"
                  className={itemClassName(item)}
                  onClick={closeMenu}
                >
                  {renderItemContent(item)}
                </a>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={itemClassName(item)}
                onClick={() => {
                  item.onClick?.();
                  closeMenu();
                }}
              >
                {renderItemContent(item)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
