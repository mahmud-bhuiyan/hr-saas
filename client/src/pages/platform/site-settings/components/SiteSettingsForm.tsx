import { FormEvent, useMemo } from 'react';
import {
  HiPaintBrush,
  HiPhoto,
  HiGlobeAlt,
  HiLink,
  HiArrowsPointingOut,
  HiSignal,
} from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import type { FaviconMimeType, LogoObjectFit, LogoShape } from '../../../../types';
import { ImageAssetField } from './ImageAssetField';

export interface SiteSettingsFormValues extends Record<string, unknown> {
  siteName: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  logoHeightPx: number;
  logoMaxWidthPx: number;
  logoObjectFit: LogoObjectFit;
  logoShape: LogoShape;
  logoShowSiteName: boolean;
  faviconMimeType: FaviconMimeType;
}

interface SiteSettingsFormProps {
  values: SiteSettingsFormValues;
  savedLogoUrl: string;
  savedFaviconUrl: string;
  savedPrimaryColor: string;
  onChange: (field: keyof SiteSettingsFormValues, value: string | number | boolean) => void;
  onLogoSave: (url: string) => Promise<void>;
  onFaviconSave: (url: string) => Promise<void>;
  onApplyColor: () => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  logoSaving: boolean;
  faviconSaving: boolean;
  colorSaving: boolean;
  hasSettingsChanges: boolean;
}

export const SiteSettingsForm = ({
  values,
  savedLogoUrl,
  savedFaviconUrl,
  savedPrimaryColor,
  onChange,
  onLogoSave,
  onFaviconSave,
  onApplyColor,
  onSubmit,
  loading,
  logoSaving,
  faviconSaving,
  colorSaving,
  hasSettingsChanges,
}: SiteSettingsFormProps) => {
  const colorChanged = useMemo(
    () => values.primaryColor.trim().toLowerCase() !== savedPrimaryColor.trim().toLowerCase(),
    [values.primaryColor, savedPrimaryColor]
  );

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="card-surface space-y-6 p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Platform branding</h2>

      <FormField label="Site name" htmlFor="siteName">
        <Input
          id="siteName"
          value={values.siteName}
          onChange={(e) => onChange('siteName', e.target.value)}
          placeholder="Daily HR"
          icon={<HiGlobeAlt className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Primary color" htmlFor="primaryColor">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="primaryColorPicker"
              type="color"
              value={values.primaryColor}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              className="h-10 w-14 shrink-0 cursor-pointer rounded border border-slate-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-800"
              aria-label="Pick primary color"
              disabled={colorSaving}
            />
            <Input
              id="primaryColor"
              value={values.primaryColor}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              placeholder="#2563eb"
              icon={<HiPaintBrush className="h-4 w-4 text-brand-600" />}
              disabled={colorSaving}
            />
            <Button
              type="button"
              icon={<HiPaintBrush className="h-4 w-4 text-white" />}
              loading={colorSaving}
              loadingText="Applying…"
              disabled={!colorChanged || colorSaving}
              onClick={onApplyColor}
              className="shrink-0 sm:self-end"
            >
              Apply color
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Pick a color or enter a hex value, then click Apply color to update the theme.
          </p>
        </div>
      </FormField>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Logo</h3>
        <ImageAssetField
          label="Logo URL or upload"
          htmlFor="logoUrl"
          asset="logo"
          url={values.logoUrl}
          savedUrl={savedLogoUrl}
          onUrlChange={(value) => onChange('logoUrl', value)}
          onSave={onLogoSave}
          saving={logoSaving}
          icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
          placeholder="https://example.com/logo.png"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Logo height (px)" htmlFor="logoHeightPx">
            <Input
              id="logoHeightPx"
              type="number"
              min={24}
              max={80}
              value={String(values.logoHeightPx)}
              onChange={(e) => onChange('logoHeightPx', Number(e.target.value))}
              icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
            />
          </FormField>
          <FormField label="Logo max width (px)" htmlFor="logoMaxWidthPx">
            <Input
              id="logoMaxWidthPx"
              type="number"
              min={80}
              max={320}
              value={String(values.logoMaxWidthPx)}
              onChange={(e) => onChange('logoMaxWidthPx', Number(e.target.value))}
              icon={<HiArrowsPointingOut className="h-4 w-4 text-brand-600" />}
            />
          </FormField>
        </div>
        <FormField label="Logo fit" htmlFor="logoObjectFit">
          <Select
            id="logoObjectFit"
            value={values.logoObjectFit}
            onChange={(e) => onChange('logoObjectFit', e.target.value as LogoObjectFit)}
            icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
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
          >
            <option value="circle">Circle</option>
            <option value="default">Default</option>
          </Select>
        </FormField>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.logoShowSiteName}
            onChange={(e) => onChange('logoShowSiteName', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Show site name next to logo
        </label>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Favicon</h3>
        <ImageAssetField
          label="Favicon URL or upload"
          htmlFor="faviconUrl"
          asset="favicon"
          url={values.faviconUrl}
          savedUrl={savedFaviconUrl}
          onUrlChange={(value) => onChange('faviconUrl', value)}
          onSave={onFaviconSave}
          saving={faviconSaving}
          icon={<HiLink className="h-4 w-4 text-brand-600" />}
          placeholder="https://example.com/favicon.ico"
        />
        <FormField label="Favicon type" htmlFor="faviconMimeType">
          <Select
            id="faviconMimeType"
            value={values.faviconMimeType}
            onChange={(e) => onChange('faviconMimeType', e.target.value as FaviconMimeType)}
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            <option value="auto">Auto-detect from URL</option>
            <option value="image/png">PNG</option>
            <option value="image/x-icon">ICO</option>
            <option value="image/svg+xml">SVG</option>
            <option value="image/webp">WebP</option>
          </Select>
        </FormField>
        </div>
      </div>

      <FormActions
        submitLabel="Save display settings"
        loading={loading}
        loadingText="Saving…"
        submitDisabled={!hasSettingsChanges}
      />
    </form>
  );
};
