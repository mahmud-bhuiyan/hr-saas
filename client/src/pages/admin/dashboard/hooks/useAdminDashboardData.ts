import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  fetchEmployeeDepartments,
  fetchEmployees,
  fetchPendingLeaveCount,
} from "../../../../lib/api";
import { hasPermission } from "../../../../utils/permissions";
import { isAnyQueryInitialLoad } from "../../../../utils/query";
import type { DashboardCard, DashboardLink } from "../../../dashboard/utils";
import {
  dashboardDescription,
  managerCards,
  managerLinks,
  tenantAdminCards,
  tenantAdminLinks,
} from "../utils";

export const useAdminDashboardData = (): {
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
  const isManager = role === "manager";

  const employeesQuery = useQuery({
    queryKey: ["admin-dashboard", "employees"],
    queryFn: () => fetchEmployees(),
    enabled: canReadEmployees,
  });

  const departmentsQuery = useQuery({
    queryKey: ["admin-dashboard", "departments"],
    queryFn: fetchEmployeeDepartments,
    enabled: canReadAllEmployees,
  });

  const pendingLeaveQuery = useQuery({
    queryKey: ["admin-dashboard", "leave", "pending-count"],
    queryFn: fetchPendingLeaveCount,
    enabled: canApproveLeave,
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

    return [];
  }, [
    role,
    canReadAllEmployees,
    isManager,
    employeesQuery.data,
    departmentsQuery.data,
    pendingLeaveCount,
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

    return [];
  }, [role, canReadAllEmployees, canCreateEmployee, isManager, user]);

  const loading = isAnyQueryInitialLoad(
    ...(canReadEmployees ? [employeesQuery] : []),
    ...(canReadAllEmployees ? [departmentsQuery] : []),
    ...(canApproveLeave ? [pendingLeaveQuery] : []),
  );

  const description = role
    ? dashboardDescription(role)
    : "Your HR workspace is ready.";

  return { cards, links, description, loading };
};
