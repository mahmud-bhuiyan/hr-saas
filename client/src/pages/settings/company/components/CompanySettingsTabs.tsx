import { FormEvent } from 'react';
import { TabGroup } from '../../../../components/ui/TabGroup';
import { useTabUrlState } from '../../../../hooks/useTabUrlState';
import { COMPANY_SETTINGS_TAB_IDS, type CompanySettingsTab } from '../utils';
import { CompanyProfileForm, type CompanyProfileFormValues } from './CompanyProfileForm';
import { TenantBrandingForm, type TenantBrandingFormValues } from './TenantBrandingForm';

interface CompanySettingsTabsProps {
  profile: {
    values: CompanyProfileFormValues;
    onChange: (field: keyof CompanyProfileFormValues, value: string) => void;
    onSubmit: (event: FormEvent) => void;
    loading: boolean;
    hasChanges: boolean;
  };
  branding: {
    values: TenantBrandingFormValues;
    displayName: string;
    onChange: (field: keyof TenantBrandingFormValues, value: string) => void;
    onClearField: (field: keyof TenantBrandingFormValues) => void;
    onSubmit: (event: FormEvent) => void;
    loading: boolean;
    hasChanges: boolean;
  };
}

export const CompanySettingsTabs = ({ profile, branding }: CompanySettingsTabsProps) => {
  const { activeTab, setActiveTab } = useTabUrlState(COMPANY_SETTINGS_TAB_IDS, {
    defaultTab: 'profile',
  });

  return (
    <TabGroup<CompanySettingsTab>
      activeId={activeTab}
      onChange={setActiveTab}
      tabs={[
        {
          id: 'profile',
          label: 'Profile',
          content: (
            <CompanyProfileForm
              values={profile.values}
              onChange={profile.onChange}
              onSubmit={profile.onSubmit}
              loading={profile.loading}
              hasChanges={profile.hasChanges}
            />
          ),
        },
        {
          id: 'branding',
          label: 'Branding',
          content: (
            <TenantBrandingForm
              values={branding.values}
              displayName={branding.displayName}
              onChange={branding.onChange}
              onClearField={branding.onClearField}
              onSubmit={branding.onSubmit}
              loading={branding.loading}
              hasChanges={branding.hasChanges}
            />
          ),
        },
      ]}
    />
  );
};
