import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { MeTabs } from "../components/MeTabs";

export const PerformancePage = () => {
  return (
    <PageContainer flushTop>
      <MeTabs />
      <PageHeader
        label="Performance"
        title="Performance"
        description="View your performance reviews and goals."
      />
      <div className="card-surface p-6 text-center text-slate-500">
        Performance feature coming soon.
      </div>
    </PageContainer>
  );
};
