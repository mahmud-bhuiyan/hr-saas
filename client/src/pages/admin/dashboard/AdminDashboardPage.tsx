import { Navigate } from "react-router-dom";
import { PageContainer } from "../../../components/ui/PageContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { homePathForRole } from "../../../utils/routes";
import { displayName } from "../../../utils/user";
import { DashboardQuickLinks } from "../../dashboard/components/DashboardQuickLinks";
import { DashboardSummaryCards } from "../../dashboard/components/DashboardSummaryCards";
import { DashboardWelcomeBanner } from "../../dashboard/components/DashboardWelcomeBanner";
import { useAdminDashboardData } from "./hooks/useAdminDashboardData";

const ADMIN_DASHBOARD_ROLES = new Set([
  "company_admin",
  "hr_manager",
  "manager",
]);

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { cards, links, loading } = useAdminDashboardData();

  if (!user || !ADMIN_DASHBOARD_ROLES.has(user.role)) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return (
    <PageContainer className="space-y-8">
      <DashboardWelcomeBanner name={displayName(user)} />

      <DashboardSummaryCards cards={cards} loading={loading} />
      <DashboardQuickLinks links={links} />
    </PageContainer>
  );
};
