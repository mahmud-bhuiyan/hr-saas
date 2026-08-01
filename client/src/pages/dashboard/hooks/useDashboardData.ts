import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchApprovedCompanies,
  fetchEmployeeDepartments,
  fetchEmployees,
  fetchPendingRegistrations,
  fetchProfile,
} from '../../../lib/api';
import { hasPermission } from '../../../utils/permissions';
import type { DashboardCard, DashboardLink } from '../utils';
import {
  dashboardDescription,
  employeeCards,
  employeeLinks,
  managerCards,
  managerLinks,
  superAdminCards,
  superAdminLinks,
  tenantAdminCards,
  tenantAdminLinks,
} from '../utils';

export const useDashboardData = (): {
  cards: DashboardCard[];
  links: DashboardLink[];
  description: string;
  loading: boolean;
} => {
  const { user } = useAuth();
  const role = user?.role;

  const isSuperAdmin = role === 'super_admin';
  const canReadEmployees =
    !!user &&
    (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));
  const canReadAllEmployees = !!user && hasPermission(user.role, 'employee:read');
  const canCreateEmployee = !!user && hasPermission(user.role, 'employee:create');
  const isManager = role === 'manager';
  const isEmployee = role === 'employee';

  const pendingQuery = useQuery({
    queryKey: ['dashboard', 'registrations', 'pending'],
    queryFn: fetchPendingRegistrations,
    enabled: isSuperAdmin,
  });

  const approvedQuery = useQuery({
    queryKey: ['dashboard', 'registrations', 'approved'],
    queryFn: fetchApprovedCompanies,
    enabled: isSuperAdmin,
  });

  const employeesQuery = useQuery({
    queryKey: ['dashboard', 'employees'],
    queryFn: () => fetchEmployees(),
    enabled: canReadEmployees && !isSuperAdmin,
  });

  const departmentsQuery = useQuery({
    queryKey: ['dashboard', 'departments'],
    queryFn: fetchEmployeeDepartments,
    enabled: canReadAllEmployees && !isSuperAdmin,
  });

  const profileQuery = useQuery({
    queryKey: ['dashboard', 'profile'],
    queryFn: fetchProfile,
    enabled: isEmployee,
  });

  const cards = useMemo((): DashboardCard[] => {
    if (!role) {
      return [];
    }

    if (isSuperAdmin) {
      return superAdminCards(pendingQuery.data ?? [], approvedQuery.data ?? []);
    }

    if (canReadAllEmployees) {
      return tenantAdminCards(employeesQuery.data ?? [], departmentsQuery.data ?? []);
    }

    if (isManager) {
      return managerCards(employeesQuery.data ?? []);
    }

    if (isEmployee) {
      return employeeCards(profileQuery.data?.companyName);
    }

    return [];
  }, [
    role,
    isSuperAdmin,
    canReadAllEmployees,
    isManager,
    isEmployee,
    pendingQuery.data,
    approvedQuery.data,
    employeesQuery.data,
    departmentsQuery.data,
    profileQuery.data,
  ]);

  const links = useMemo((): DashboardLink[] => {
    if (!role) {
      return [];
    }

    if (isSuperAdmin) {
      return superAdminLinks();
    }

    if (canReadAllEmployees) {
      return tenantAdminLinks(canCreateEmployee);
    }

    if (isManager) {
      return managerLinks();
    }

    if (isEmployee) {
      return employeeLinks();
    }

    return [];
  }, [role, isSuperAdmin, canReadAllEmployees, canCreateEmployee, isManager, isEmployee]);

  const loading =
    (isSuperAdmin && (pendingQuery.isLoading || approvedQuery.isLoading)) ||
    (canReadEmployees && !isSuperAdmin && employeesQuery.isLoading) ||
    (canReadAllEmployees && !isSuperAdmin && departmentsQuery.isLoading) ||
    (isEmployee && profileQuery.isLoading);

  const description = role ? dashboardDescription(role) : 'Your HR workspace is ready.';

  return { cards, links, description, loading };
};
