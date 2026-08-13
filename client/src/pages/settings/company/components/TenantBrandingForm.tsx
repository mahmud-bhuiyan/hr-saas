import { FormEvent } from 'react';
import { HiPhoto } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';

export interface TenantBrandingFormValues extends Record<string, unknown> {
  logoUrl: string;
}

interface TenantBrandingFormProps {
  values: TenantBrandingFormValues;
  displayName: string;
  onChange: (field: keyof TenantBrandingFormValues, value: string) => void;
  onClearField: (field: keyof TenantBrandingFormValues) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const TenantBrandingForm = ({
  values,
  displayName,
  onChange,
  onClearField,
  onSubmit,
  loading,
  hasChanges,
}: TenantBrandingFormProps) => {
  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="card-surface space-y-6 p-6"
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Override the platform logo for your company. Leave the field empty and save to revert to the
        platform default. Theme colors are controlled by each user&apos;s personal theme choice.
      </p>

      <FormField label="Logo URL override" htmlFor="logoUrl">
        <Input
          id="logoUrl"
          value={values.logoUrl}
          onChange={(e) => onChange('logoUrl', e.target.value)}
          placeholder="https://example.com/company-logo.png"
          icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
          disabled={loading}
        />
        {values.logoUrl && (
          <button
            type="button"
            onClick={() => onClearField('logoUrl')}
            className="mt-2 text-sm text-brand-600 hover:text-brand-700"
          >
            Clear logo override
          </button>
        )}
      </FormField>

      <div className="space-y-4 border-t border-slate-200 pt-3 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preview</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            {values.logoUrl ? (
              <img src={values.logoUrl} alt={displayName} className="h-8 max-w-[140px] object-contain" />
            ) : (
              <span className="text-base font-semibold text-brand-700 dark:text-brand-400">{displayName}</span>
            )}
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs text-white">Logo</span>
          </div>
        </div>
      </div>

      <FormActions
        submitLabel="Save changes"
        loading={loading}
        loadingText="Saving…"
        submitDisabled={!hasChanges || loading}
      />
    </form>
  );
};
