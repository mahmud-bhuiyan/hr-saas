import { Navigate } from "react-router-dom";
import { PageContainer } from "../../../components/ui/PageContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { homePathForRole } from "../../../utils/routes";
import { displayName } from "../../../utils/user";
import { DashboardQuickLinks } from "../../dashboard/components/DashboardQuickLinks";
import { DashboardSummaryCards } from "../../dashboard/components/DashboardSummaryCards";
import { DashboardWelcomeBanner } from "../../dashboard/components/DashboardWelcomeBanner";
import { useEmployeeDashboardData } from "./hooks/useEmployeeDashboardData";

export const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const { cards, links, loading } = useEmployeeDashboardData();

  if (user?.role !== "employee") {
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
