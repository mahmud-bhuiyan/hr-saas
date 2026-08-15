import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { fetchMyLeaveBalance, fetchProfile } from "../../../../lib/api";
import { hasPermission } from "../../../../utils/permissions";
import { isAnyQueryInitialLoad } from "../../../../utils/query";
import type { DashboardCard, DashboardLink } from "../../../dashboard/utils";
import {
  employeeCards,
  employeeDashboardDescription,
  employeeLinks,
} from "../utils";

export const useEmployeeDashboardData = (): {
  cards: DashboardCard[];
  links: DashboardLink[];
  description: string;
  loading: boolean;
} => {
  const { user } = useAuth();
  const canReadOwnLeave = !!user && hasPermission(user.role, "leave:read:own");

  const profileQuery = useQuery({
    queryKey: ["my-dashboard", "profile"],
    queryFn: fetchProfile,
    enabled: Boolean(user),
  });

  const leaveBalanceQuery = useQuery({
    queryKey: ["my-dashboard", "leave", "balance"],
    queryFn: fetchMyLeaveBalance,
    enabled: canReadOwnLeave,
    retry: false,
  });

  const cards = useMemo(
    (): DashboardCard[] =>
      employeeCards(
        profileQuery.data?.companyName,
        leaveBalanceQuery.isError ? undefined : leaveBalanceQuery.data,
      ),
    [profileQuery.data, leaveBalanceQuery.data, leaveBalanceQuery.isError],
  );

  const links = useMemo((): DashboardLink[] => employeeLinks(user), [user]);

  const loading = isAnyQueryInitialLoad(profileQuery, leaveBalanceQuery);

  return {
    cards,
    links,
    description: employeeDashboardDescription,
    loading,
  };
};
