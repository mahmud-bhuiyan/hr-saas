import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  fetchEmployeeDepartments,
  fetchEmployees,
  fetchMyLeaveBalance,
  fetchPendingLeaveCount,
  fetchProfile,
} from "../../../lib/api";
import { hasPermission } from "../../../utils/permissions";
import { isAnyQueryInitialLoad } from "../../../utils/query";
import type { DashboardCard, DashboardLink } from "../utils";
import {
  dashboardDescription,
  employeeCards,
  employeeLinks,
  managerCards,
  managerLinks,
  tenantAdminCards,
  tenantAdminLinks,
} from "../utils";

export const useDashboardData = (): {
  cards: DashboardCard[];
  links: DashboardLink[];
  description: string;
  loading: boolean;
} => {
  const { user } = useAuth();
  const role = user?.role;

  const canReadEmployees =
    !!user &&
    (hasPermission(user.role, "employee:read") ||
      hasPermission(user.role, "employee:read:team"));
  const canReadAllEmployees =
    !!user && hasPermission(user.role, "employee:read");
  const canCreateEmployee =
    !!user && hasPermission(user.role, "employee:create");
  const canApproveLeave =
    !!user &&
    (hasPermission(user.role, "leave:approve") ||
      hasPermission(user.role, "leave:approve:team"));
  const canReadOwnLeave = !!user && hasPermission(user.role, "leave:read:own");
  const isManager = role === "manager";
  const isEmployee = role === "employee";

  const employeesQuery = useQuery({
    queryKey: ["dashboard", "employees"],
    queryFn: () => fetchEmployees(),
    enabled: canReadEmployees,
  });

  const departmentsQuery = useQuery({
    queryKey: ["dashboard", "departments"],
    queryFn: fetchEmployeeDepartments,
    enabled: canReadAllEmployees,
  });

  const profileQuery = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: fetchProfile,
    enabled: isEmployee,
  });

  const pendingLeaveQuery = useQuery({
    queryKey: ["dashboard", "leave", "pending-count"],
    queryFn: fetchPendingLeaveCount,
    enabled: canApproveLeave,
  });

  const leaveBalanceQuery = useQuery({
    queryKey: ["dashboard", "leave", "balance"],
    queryFn: fetchMyLeaveBalance,
    enabled: canReadOwnLeave && isEmployee,
    retry: false,
  });

  const pendingLeaveCount = pendingLeaveQuery.data ?? 0;

  const cards = useMemo((): DashboardCard[] => {
    if (!role) {
      return [];
    }

    if (canReadAllEmployees) {
      return tenantAdminCards(
        employeesQuery.data ?? [],
        departmentsQuery.data ?? [],
        pendingLeaveCount,
      );
    }

    if (isManager) {
      return managerCards(employeesQuery.data ?? [], pendingLeaveCount);
    }

    if (isEmployee) {
      return employeeCards(
        profileQuery.data?.companyName,
        leaveBalanceQuery.isError ? undefined : leaveBalanceQuery.data,
      );
    }

    return [];
  }, [
    role,
    canReadAllEmployees,
    isManager,
    isEmployee,
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

    if (canReadAllEmployees) {
      return tenantAdminLinks(canCreateEmployee, user);
    }

    if (isManager) {
      return managerLinks(user);
    }

    if (isEmployee) {
      return employeeLinks(user);
    }

    return [];
  }, [
    role,
    canReadAllEmployees,
    canCreateEmployee,
    isManager,
    isEmployee,
    user,
  ]);

  const loading = isAnyQueryInitialLoad(
    ...(canReadEmployees ? [employeesQuery] : []),
    ...(canReadAllEmployees ? [departmentsQuery] : []),
    ...(canApproveLeave ? [pendingLeaveQuery] : []),
    ...(isEmployee ? [profileQuery, leaveBalanceQuery] : []),
  );

  const description = role
    ? dashboardDescription(role)
    : "Your HR workspace is ready.";

  return { cards, links, description, loading };
};
