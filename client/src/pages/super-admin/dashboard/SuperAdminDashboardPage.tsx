import { Navigate } from "react-router-dom";
import { PageContainer } from "../../../components/ui/PageContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { homePathForRole } from "../../../utils/routes";
import { displayName } from "../../../utils/user";
import { DashboardQuickLinks } from "../../dashboard/components/DashboardQuickLinks";
import { DashboardSummaryCards } from "../../dashboard/components/DashboardSummaryCards";
import { DashboardWelcomeBanner } from "../../dashboard/components/DashboardWelcomeBanner";
import { useSuperAdminDashboardData } from "./hooks/useSuperAdminDashboardData";

export const SuperAdminDashboardPage = () => {
  const { user } = useAuth();
  const { cards, links, loading } = useSuperAdminDashboardData();

  if (user?.role !== "super_admin") {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return (
    <PageContainer className="space-y-8">
      {user && <DashboardWelcomeBanner name={displayName(user)} />}

      <DashboardSummaryCards cards={cards} loading={loading} />
      <DashboardQuickLinks links={links} />
    </PageContainer>
  );
};
