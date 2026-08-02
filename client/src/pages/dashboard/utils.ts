import type { Employee, LeaveBalance, RegistrationRequest, UserRole } from '../../types';

export type DashboardCard = {
  label: string;
  value: string | number;
  note?: string;
};

export type DashboardLink = {
  label: string;
  to?: string;
  note?: string;
  disabled?: boolean;
};

const countByStatus = (employees: Employee[], status: Employee['status']): number =>
  employees.filter((employee) => employee.status === status).length;

export const superAdminCards = (
  pending: RegistrationRequest[],
  approved: RegistrationRequest[]
): DashboardCard[] => {
  const activeCompanies = approved.filter((company) => company.isActive).length;
  const inactiveCompanies = approved.length - activeCompanies;

  return [
    { label: 'Pending registrations', value: pending.length, note: 'Awaiting review' },
    { label: 'Registered companies', value: approved.length, note: 'Approved tenants' },
    { label: 'Active companies', value: activeCompanies, note: 'Currently enabled' },
    { label: 'Inactive companies', value: inactiveCompanies, note: 'Deactivated tenants' },
  ];
};

export const superAdminLinks = (): DashboardLink[] => [
  { label: 'Review pending registrations', to: '/dashboard/registrations' },
  { label: 'Add company', to: '/dashboard/registrations' },
  { label: 'View registered companies', to: '/dashboard/registrations' },
  { label: 'Platform site settings', to: '/dashboard/platform/site-settings' },
];

export const tenantAdminCards = (
  employees: Employee[],
  departments: string[],
  pendingLeave: number
): DashboardCard[] => [
  { label: 'Total employees', value: employees.length, note: 'All records' },
  { label: 'Active employees', value: countByStatus(employees, 'active'), note: 'Currently working' },
  { label: 'Pending leave', value: pendingLeave, note: 'Awaiting approval' },
  { label: 'Departments', value: departments.length, note: 'Unique departments' },
];

export const tenantAdminLinks = (canCreate: boolean): DashboardLink[] => [
  ...(canCreate ? [{ label: 'Add employee', to: '/dashboard/employees' }] : []),
  { label: 'View employees', to: '/dashboard/employees' },
  { label: 'Review leave requests', to: '/dashboard/leave' },
  { label: 'Company settings', to: '/dashboard/settings' },
  { label: 'Upload document', to: '/dashboard/documents' },
];

export const managerCards = (team: Employee[], pendingLeave: number): DashboardCard[] => {
  const departments = new Set(team.map((member) => member.department).filter(Boolean));

  return [
    { label: 'Direct reports', value: team.length, note: 'Your team members' },
    { label: 'Active team', value: countByStatus(team, 'active'), note: 'Currently working' },
    { label: 'Pending leave', value: pendingLeave, note: 'Team requests to review' },
    { label: 'Departments', value: departments.size, note: 'In your team' },
  ];
};

export const managerLinks = (): DashboardLink[] => [
  { label: 'View team', to: '/dashboard/employees' },
  { label: 'Review leave requests', to: '/dashboard/leave' },
  { label: 'Request leave', to: '/dashboard/leave' },
];

export const employeeCards = (
  companyName?: string,
  balance?: LeaveBalance
): DashboardCard[] => [
  { label: 'Company', value: companyName ?? '—', note: 'Your organization' },
  {
    label: 'Leave balance',
    value: balance != null ? balance.remaining : '—',
    note: balance != null ? `${balance.year} annual leave remaining` : 'View on Leave page',
  },
  { label: 'Documents', value: '—', note: 'View on Documents page' },
  { label: 'My requests', value: balance != null ? balance.pending : '—', note: 'Pending approval' },
];

export const employeeLinks = (): DashboardLink[] => [
  { label: 'My profile', to: '/dashboard/profile' },
  { label: 'Request leave', to: '/dashboard/leave' },
  { label: 'My documents', to: '/dashboard/documents' },
];

export const dashboardDescription = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Review company registrations and manage platform tenants.';
    case 'company_admin':
      return 'Manage your workforce, leave, and documents from one place.';
    case 'hr_manager':
      return 'Oversee employees, leave, and HR documents for your company.';
    case 'manager':
      return 'View your team and stay on top of pending approvals.';
    case 'employee':
      return 'Access your profile, leave, and documents in one place.';
    default:
      return 'Your HR workspace is ready.';
  }
};
