import { PageContainer } from "../../components/ui/PageContainer";
import { useAuth } from "../../contexts/AuthContext";
import { displayName } from "../../utils/user";
import { DashboardQuickLinks } from "./components/DashboardQuickLinks";
import { DashboardSummaryCards } from "./components/DashboardSummaryCards";
import { DashboardWelcomeBanner } from "./components/DashboardWelcomeBanner";
import { useDashboardData } from "./hooks/useDashboardData";

export const TenantDashboardPage = () => {
  const { user } = useAuth();
  const { cards, links, loading } = useDashboardData();

  return (
    <PageContainer className="space-y-8">
      {user && <DashboardWelcomeBanner name={displayName(user)} />}

      <DashboardSummaryCards cards={cards} loading={loading} />
      <DashboardQuickLinks links={links} />
    </PageContainer>
  );
};
