import { FormEvent } from 'react';
import { TabGroup } from '../../../../components/ui/TabGroup';
import { useTabUrlState } from '../../../../hooks/useTabUrlState';
import type { LogoObjectFit, LogoShape, SidebarBehavior } from '../../../../types';
import { SITE_SETTINGS_TAB_IDS, type SiteSettingsTab } from '../utils';
import { FaviconSettingsTab } from './FaviconSettingsTab';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { LogoSettingsTab } from './LogoSettingsTab';
import { SidebarSettingsTab } from './SidebarSettingsTab';

export interface SiteSettingsFormValues extends Record<string, unknown> {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  logoHeightPx: number;
  logoMaxWidthPx: number;
  logoObjectFit: LogoObjectFit;
  logoShape: LogoShape;
  logoShowSiteName: boolean;
  sidebarBehavior: SidebarBehavior;
  sidebarCollapsedWidthPx: number;
  sidebarExpandedWidthPx: number;
}

interface SiteSettingsFormProps {
  values: SiteSettingsFormValues;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onSubmit: (tab: SiteSettingsTab, event: FormEvent) => void;
  savingTab: SiteSettingsTab | null;
  tabChanges: Record<SiteSettingsTab, boolean>;
}

export const SiteSettingsForm = ({
  values,
  onChange,
  onSubmit,
  savingTab,
  tabChanges,
}: SiteSettingsFormProps) => {
  const { activeTab, setActiveTab } = useTabUrlState(SITE_SETTINGS_TAB_IDS, {
    defaultTab: 'general',
  });
  const isTabLoading = (tab: SiteSettingsTab) => savingTab === tab;

  return (
    <TabGroup<SiteSettingsTab>
      activeId={activeTab}
      onChange={setActiveTab}
      tabs={[
        {
          id: 'general',
          label: 'General',
          content: (
            <GeneralSettingsTab
              values={values}
              onChange={onChange}
              onSubmit={(event) => onSubmit('general', event)}
              loading={isTabLoading('general')}
              hasChanges={tabChanges.general}
            />
          ),
        },
        {
          id: 'logo',
          label: 'Logo',
          content: (
            <LogoSettingsTab
              values={values}
              onChange={onChange}
              onSubmit={(event) => onSubmit('logo', event)}
              loading={isTabLoading('logo')}
              hasChanges={tabChanges.logo}
            />
          ),
        },
        {
          id: 'favicon',
          label: 'Favicon',
          content: (
            <FaviconSettingsTab
              values={values}
              onChange={onChange}
              onSubmit={(event) => onSubmit('favicon', event)}
              loading={isTabLoading('favicon')}
              hasChanges={tabChanges.favicon}
            />
          ),
        },
        {
          id: 'sidebar',
          label: 'Sidebar',
          content: (
            <SidebarSettingsTab
              values={values}
              onChange={onChange}
              onSubmit={(event) => onSubmit('sidebar', event)}
              loading={isTabLoading('sidebar')}
              hasChanges={tabChanges.sidebar}
            />
          ),
        },
      ]}
    />
  );
};
