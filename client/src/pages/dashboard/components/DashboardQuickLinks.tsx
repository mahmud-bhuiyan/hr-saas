import { Link } from 'react-router-dom';
import type { DashboardLink } from '../utils';

type DashboardQuickLinksProps = {
  links: DashboardLink[];
};

export const DashboardQuickLinks = ({ links }: DashboardQuickLinksProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {links.map((link) => (
          <li key={link.label} className="flex items-center justify-between py-3">
            {link.disabled || !link.to ? (
              <span className="text-sm font-medium text-slate-700">{link.label}</span>
            ) : (
              <Link
                to={link.to}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                {link.label}
              </Link>
            )}
            {link.note ? <span className="text-xs text-slate-400">{link.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};
