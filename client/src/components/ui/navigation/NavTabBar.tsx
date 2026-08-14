import { Link } from "react-router-dom";

export interface NavTabBarItem {
  id: string;
  label: string;
  /** When set, renders a router Link instead of a button. */
  to?: string;
}

export interface NavTabBarColors {
  /** Bar background. Default: `bg-[#0A1D2C]` */
  bar?: string;
  /** Active tab text. Default: `text-white` */
  active?: string;
  /** Inactive tab text and hover. Default: `text-slate-400 hover:text-slate-200` */
  inactive?: string;
  /** Active indicator bottom border. Default: `border-b-[#82b53a]` */
  indicator?: string;
}

export interface NavTabBarProps {
  tabs: NavTabBarItem[];
  activeId: string;
  onChange?: (id: string) => void;
  /** Pull the bar edge-to-edge inside padded main content. */
  bleed?: boolean;
  /** Tailwind classes for bar and tab states. Omitted keys use the dark nav defaults. */
  colors?: NavTabBarColors;
  className?: string;
  "aria-label"?: string;
}

const defaultNavTabBarColors: Required<NavTabBarColors> = {
  bar: "bg-[#0A1D2C]",
  active: "text-white",
  inactive: "text-slate-400 hover:text-slate-200",
  indicator: "border-b-[#82b53a]",
};

const tabClassName = (isActive: boolean, colors: Required<NavTabBarColors>) =>
  `relative flex h-full items-center px-1 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
    isActive ? colors.active : colors.inactive
  }`;

const ActiveIndicator = ({
  indicatorClassName,
}: {
  indicatorClassName: string;
}) => (
  <span
    aria-hidden
    className={`absolute bottom-0 left-1/2 -ml-2 border-[8px] border-transparent ${indicatorClassName}`}
  />
);

export const NavTabBar = ({
  tabs,
  activeId,
  onChange,
  bleed = false,
  colors,
  className = "",
  "aria-label": ariaLabel = "Section navigation",
}: NavTabBarProps) => {
  if (tabs.length === 0) {
    return null;
  }

  const resolvedColors = { ...defaultNavTabBarColors, ...colors };
  const bleedClassName = bleed ? "-mx-3 -mt-6 mb-6 md:-mx-4" : "";

  return (
    <div
      className={`flex h-14 items-center px-3 md:px-4 ${resolvedColors.bar} ${bleedClassName} ${className}`.trim()}
    >
      <nav className="flex h-full gap-6" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          const tabClasses = tabClassName(isActive, resolvedColors);

          if (tab.to) {
            return (
              <Link
                key={tab.id}
                to={tab.to}
                aria-current={isActive ? "page" : undefined}
                className={tabClasses}
              >
                {tab.label}
                {isActive && (
                  <ActiveIndicator
                    indicatorClassName={resolvedColors.indicator}
                  />
                )}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={tabClasses}
            >
              {tab.label}
              {isActive && (
                <ActiveIndicator
                  indicatorClassName={resolvedColors.indicator}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
