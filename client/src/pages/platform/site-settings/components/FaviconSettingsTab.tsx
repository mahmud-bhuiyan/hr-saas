import { FormEvent } from 'react';
import { HiLink } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { ImageAssetField } from './ImageAssetField';
import type { SiteSettingsFormValues } from './SiteSettingsForm';

interface FaviconSettingsTabProps {
  values: SiteSettingsFormValues;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const FaviconSettingsTab = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: FaviconSettingsTabProps) => (
  <form onSubmit={(e) => void onSubmit(e)} className="card-surface space-y-6 p-6">
    <ImageAssetField
      label="Favicon URL or upload"
      htmlFor="faviconUrl"
      asset="favicon"
      url={values.faviconUrl}
      onUrlChange={(value) => onChange('faviconUrl', value)}
      disabled={loading}
      icon={<HiLink className="h-4 w-4 text-brand-600" />}
      placeholder="https://example.com/favicon.ico"
      saveHint="Paste a URL or upload an image, then save favicon settings to apply changes."
    />

    <FormActions
      submitLabel="Save favicon settings"
      loading={loading}
      loadingText="Saving…"
      submitDisabled={!hasChanges || loading}
    />
  </form>
);
