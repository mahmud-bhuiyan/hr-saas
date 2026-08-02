import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <BrandMark textClassName="text-2xl font-semibold text-brand-700" />
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>}
      </div>
    </div>
  );
};
