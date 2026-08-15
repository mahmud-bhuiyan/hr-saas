import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { MyTabs } from "../components/MyTabs";

export const PerformancePage = () => {
  return (
    <PageContainer flushTop>
      <MyTabs />
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
