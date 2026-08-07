import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';

export const MyTeamPage = () => {
  return (
    <PageContainer>
      <PageHeader
        label="People"
        title="My Team"
        description="View and manage the employees who report to you."
      />
    </PageContainer>
  );
};
