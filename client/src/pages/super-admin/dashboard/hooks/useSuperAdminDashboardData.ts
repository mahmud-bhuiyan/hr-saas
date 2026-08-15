import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchApprovedCompanies,
  fetchPendingRegistrations,
} from "../../../../lib/api";
import { isAnyQueryInitialLoad } from "../../../../utils/query";
import type { DashboardCard, DashboardLink } from "../../../dashboard/utils";
import {
  SUPER_ADMIN_DASHBOARD_DESCRIPTION,
  superAdminCards,
  superAdminLinks,
} from "../utils";

export const useSuperAdminDashboardData = (): {
  cards: DashboardCard[];
  links: DashboardLink[];
  description: string;
  loading: boolean;
} => {
  const pendingQuery = useQuery({
    queryKey: ["super-admin", "dashboard", "registrations", "pending"],
    queryFn: fetchPendingRegistrations,
  });

  const approvedQuery = useQuery({
    queryKey: ["super-admin", "dashboard", "registrations", "approved"],
    queryFn: fetchApprovedCompanies,
  });

  const cards = useMemo(
    (): DashboardCard[] =>
      superAdminCards(pendingQuery.data ?? [], approvedQuery.data ?? []),
    [pendingQuery.data, approvedQuery.data],
  );

  const links = useMemo((): DashboardLink[] => superAdminLinks(), []);

  const loading = isAnyQueryInitialLoad(pendingQuery, approvedQuery);

  return {
    cards,
    links,
    description: SUPER_ADMIN_DASHBOARD_DESCRIPTION,
    loading,
  };
};
