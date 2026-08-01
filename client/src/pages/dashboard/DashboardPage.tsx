import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardQuickLinks } from './components/DashboardQuickLinks';
import { DashboardSummaryCards } from './components/DashboardSummaryCards';
import { useDashboardData } from './hooks/useDashboardData';

const displayName = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }
  return email?.split('@')[0] ?? 'there';
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const { cards, links, description, loading } = useDashboardData();

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Dashboard"
        title={`Welcome back, ${displayName(user?.firstName, user?.lastName, user?.email)}`}
        description={description}
      />

      <DashboardSummaryCards cards={cards} loading={loading} />
      <DashboardQuickLinks links={links} />
    </PageContainer>
  );
};
