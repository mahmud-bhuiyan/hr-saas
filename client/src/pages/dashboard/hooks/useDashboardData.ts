import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchApprovedCompanies,
  fetchEmployeeDepartments,
  fetchEmployees,
  fetchMyLeaveBalance,
  fetchPendingLeaveCount,
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
  const canApproveLeave =
    !!user &&
    (hasPermission(user.role, 'leave:approve') || hasPermission(user.role, 'leave:approve:team'));
  const canReadOwnLeave = !!user && hasPermission(user.role, 'leave:read:own');
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

  const pendingLeaveQuery = useQuery({
    queryKey: ['dashboard', 'leave', 'pending-count'],
    queryFn: fetchPendingLeaveCount,
    enabled: canApproveLeave && !isSuperAdmin,
  });

  const leaveBalanceQuery = useQuery({
    queryKey: ['dashboard', 'leave', 'balance'],
    queryFn: fetchMyLeaveBalance,
    enabled: canReadOwnLeave && isEmployee,
    retry: false,
  });

  const pendingLeaveCount = pendingLeaveQuery.data ?? 0;

  const cards = useMemo((): DashboardCard[] => {
    if (!role) {
      return [];
    }

    if (isSuperAdmin) {
      return superAdminCards(pendingQuery.data ?? [], approvedQuery.data ?? []);
    }

    if (canReadAllEmployees) {
      return tenantAdminCards(
        employeesQuery.data ?? [],
        departmentsQuery.data ?? [],
        pendingLeaveCount
      );
    }

    if (isManager) {
      return managerCards(employeesQuery.data ?? [], pendingLeaveCount);
    }

    if (isEmployee) {
      return employeeCards(
        profileQuery.data?.companyName,
        leaveBalanceQuery.isError ? undefined : leaveBalanceQuery.data
      );
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
    pendingLeaveCount,
    leaveBalanceQuery.data,
    leaveBalanceQuery.isError,
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
    (canApproveLeave && !isSuperAdmin && pendingLeaveQuery.isLoading) ||
    (isEmployee && (profileQuery.isLoading || leaveBalanceQuery.isLoading));

  const description = role ? dashboardDescription(role) : 'Your HR workspace is ready.';

  return { cards, links, description, loading };
};
