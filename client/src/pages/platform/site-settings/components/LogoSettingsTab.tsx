import { FormEvent } from 'react';
import { HiArrowsPointingOut, HiPhoto } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import type { LogoObjectFit, LogoShape } from '../../../../types';
import { ImageAssetField } from './ImageAssetField';
import type { SiteSettingsFormValues } from './SiteSettingsForm';

interface LogoSettingsTabProps {
  values: SiteSettingsFormValues;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const LogoSettingsTab = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: LogoSettingsTabProps) => (
  <form onSubmit={(e) => void onSubmit(e)} className="card-surface space-y-6 p-6">
    <ImageAssetField
      label="Logo URL or upload"
      htmlFor="logoUrl"
      asset="logo"
      url={values.logoUrl}
      onUrlChange={(value) => onChange('logoUrl', value)}
      disabled={loading}
      icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
      placeholder="https://example.com/logo.png"
      saveHint="Paste a URL or upload an image, then save logo settings to apply changes."
    />

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Logo height (24–80 px)" htmlFor="logoHeightPx">
        <Input
          id="logoHeightPx"
          type="number"
          min={24}
          max={80}
          value={String(values.logoHeightPx)}
          onChange={(e) => onChange('logoHeightPx', Number(e.target.value))}
          icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        />
      </FormField>
      <FormField label="Logo max width (80–320 px)" htmlFor="logoMaxWidthPx">
        <Input
          id="logoMaxWidthPx"
          type="number"
          min={80}
          max={320}
          value={String(values.logoMaxWidthPx)}
          onChange={(e) => onChange('logoMaxWidthPx', Number(e.target.value))}
          icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        />
      </FormField>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Logo fit" htmlFor="logoObjectFit">
        <Select
          id="logoObjectFit"
          value={values.logoObjectFit}
          onChange={(e) => onChange('logoObjectFit', e.target.value as LogoObjectFit)}
          icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
        </Select>
      </FormField>
      <FormField label="Logo shape" htmlFor="logoShape">
        <Select
          id="logoShape"
          value={values.logoShape}
          onChange={(e) => onChange('logoShape', e.target.value as LogoShape)}
          icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        >
          <option value="circle">Circle</option>
          <option value="default">Default</option>
        </Select>
      </FormField>
    </div>

    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={values.logoShowSiteName}
        onChange={(e) => onChange('logoShowSiteName', e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        disabled={loading}
      />
      Show site name next to logo
    </label>

    <FormActions
      submitLabel="Save logo settings"
      loading={loading}
      loadingText="Saving…"
      submitDisabled={!hasChanges || loading}
    />
  </form>
);
