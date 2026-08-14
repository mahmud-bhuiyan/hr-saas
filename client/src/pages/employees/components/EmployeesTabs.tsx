import { useLocation } from 'react-router-dom';
import { NavTabBar } from '../../../components/ui/navigation/NavTabBar';
import { EMPLOYEES_ACTIVE_PATH, EMPLOYEES_INACTIVE_PATH } from '../utils';

const tabs = [
  { label: 'ACTIVE EMPLOYEES', path: EMPLOYEES_ACTIVE_PATH },
  { label: 'INACTIVE EMPLOYEES', path: EMPLOYEES_INACTIVE_PATH },
] as const;

export const EmployeesTabs = () => {
  const location = useLocation();

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
