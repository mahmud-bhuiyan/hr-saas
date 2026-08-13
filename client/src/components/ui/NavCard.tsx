import { Link } from "react-router-dom";
import type { IconType } from "react-icons";

export interface NavCardProps {
  to: string;
  label: string;
  description: string;
  icon: IconType;
  className?: string;
}

export const NavCard = ({
  to,
  label,
  description,
  icon: Icon,
  className = "",
}: NavCardProps) => {
  return (
    <Link
      to={to}
      className={`rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40 ${className}`.trim()}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
          <Icon className="h-5 w-5 text-brand-600" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            {label}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};
