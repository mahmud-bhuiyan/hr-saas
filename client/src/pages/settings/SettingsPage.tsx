import { Link, Navigate } from 'react-router-dom';
import {
  HiBuildingOffice2,
  HiPaintBrush,
  HiRectangleGroup,
  HiUsers,
  HiClipboardDocumentList,
  HiClock,
  HiCalendarDays,
  HiCreditCard,
} from 'react-icons/hi2';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

type SettingsLink = {
  to: string;
  label: string;
  description: string;
  icon: typeof HiBuildingOffice2;
  roles: UserRole[];
};

const settingsLinks: SettingsLink[] = [
  {
    to: '/dashboard/settings/company',
    label: 'Company profile',
    description: 'Update company name, address, and logo.',
    icon: HiBuildingOffice2,
    roles: ['company_admin'],
  },
  {
    to: '/dashboard/settings/branding',
    label: 'Company branding',
    description: 'Customize logo and theme color for your organization.',
    icon: HiPaintBrush,
    roles: ['company_admin'],
  },
  {
    to: '/dashboard/settings/departments',
    label: 'Departments',
    description: 'Manage departments used when assigning employees.',
    icon: HiRectangleGroup,
    roles: ['company_admin', 'hr_manager'],
  },
  {
    to: '/dashboard/settings/audit-log',
    label: 'Audit log',
    description: 'Review sensitive changes across your organization.',
    icon: HiClipboardDocumentList,
    roles: ['company_admin', 'hr_manager'],
  },
  {
    to: '/dashboard/settings/attendance',
    label: 'Attendance',
    description: 'Configure GPS tracking and attendance policies.',
    icon: HiClock,
    roles: ['company_admin'],
  },
  {
    to: '/dashboard/settings/leave',
    label: 'Leave policy',
    description: 'Annual entitlement, carry-over, and multi-step approval.',
    icon: HiCalendarDays,
    roles: ['company_admin'],
  },
  {
    to: '/dashboard/settings/billing',
    label: 'Billing',
    description: 'Manage your per-seat Stripe subscription and seat count.',
    icon: HiCreditCard,
    roles: ['company_admin'],
  },
  {
    to: '/dashboard/settings/users',
    label: 'Users & roles',
    description: 'View users and assign roles within your company.',
    icon: HiUsers,
    roles: ['company_admin'],
  },
];

export const SettingsPage = () => {
  const { user } = useAuth();

  if (!user || !['company_admin', 'hr_manager'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const links = settingsLinks.filter((link) => link.roles.includes(user.role));

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Settings"
        title="Company settings"
        description="Manage your organization profile, departments, users, and branding."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
                  <Icon className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{link.label}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
};
