import { useLocation } from 'react-router-dom';
import { NavTabBar } from '../../../components/ui/navigation/NavTabBar';
import { useAuth } from '../../../contexts/AuthContext';
import type { TenantModuleId } from '../../../types/modules';
import { isModuleEnabledForUser } from '../../../utils/modules';

const allTabs: Array<{
  label: string;
  path: string;
  module?: TenantModuleId;
}> = [
  { label: 'ATTENDANCE', path: '/me/attendance', module: 'attendance' },
  { label: 'LEAVE', path: '/me/leave', module: 'leave' },
  { label: 'PERFORMANCE', path: '/me/performance' },
  { label: 'EXPENSES & TRAVEL', path: '/me/expenses', module: 'expenses' },
];

export const MeTabs = () => {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = allTabs.filter(
    (tab) => !tab.module || isModuleEnabledForUser(user, tab.module),
  );

  if (tabs.length === 0) {
    return null;
  }

  const activeId =
    tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? '';

  return (
    <NavTabBar
      bleed
      tabs={tabs.map((tab) => ({
        id: tab.path,
        label: tab.label,
        to: tab.path,
      }))}
      activeId={activeId}
    />
  );
};
