import { Link } from 'react-router-dom';
import { BrandMark } from '../../../components/BrandMark';
import type { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export const LegalSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
  </section>
);

export const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/login" className="inline-flex">
            <BrandMark textClassName="text-base font-semibold text-brand-700" />
          </Link>
          <Link to="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Daily HR. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
              Terms of Use
            </Link>
            <Link to="/privacy" className="font-medium text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
