import { Link, Navigate } from 'react-router-dom';
import { HiChartBarSquare, HiUserGroup } from 'react-icons/hi2';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

const reportLinks = [
  {
    to: '/dashboard/reports/headcount',
    label: 'Headcount',
    description: 'Employee counts by department and employment status.',
    icon: HiUserGroup,
  },
  {
    to: '/dashboard/reports/absence',
    label: 'Absence summary',
    description: 'Approved leave days taken by type and department.',
    icon: HiChartBarSquare,
  },
];

export const ReportsPage = () => {
  const { user } = useAuth();
  const canRead = user && hasPermission(user.role, 'report:read');

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageContainer>
      <PageHeader
        label="Insights"
        title="Reports"
        description="Operational reports for HR and company administrators."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {reportLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/50"
            >
              <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 dark:bg-brand-500/15">
                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-400">
                {link.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
};
