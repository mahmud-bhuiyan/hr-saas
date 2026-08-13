import { FormEvent } from 'react';
import { HiGlobeAlt } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import type { SiteSettingsFormValues } from './SiteSettingsForm';

interface GeneralSettingsTabProps {
  values: SiteSettingsFormValues;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const GeneralSettingsTab = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: GeneralSettingsTabProps) => (
  <form onSubmit={(e) => void onSubmit(e)} className="card-surface space-y-6 p-6">
    <FormField label="Site name" htmlFor="siteName">
      <Input
        id="siteName"
        value={values.siteName}
        onChange={(e) => onChange('siteName', e.target.value)}
        placeholder="Daily HR"
        icon={<HiGlobeAlt className="h-4 w-4 text-brand-600" />}
        disabled={loading}
      />
    </FormField>

    <FormActions
      submitLabel="Save general settings"
      loading={loading}
      loadingText="Saving…"
      submitDisabled={!hasChanges || loading}
    />
  </form>
);
