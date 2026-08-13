import { FormEvent } from 'react';
import { HiBuildingOffice2, HiMapPin } from 'react-icons/hi2';
import { FormActions } from '../../../../components/ui/FormActions';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';

export interface CompanyProfileFormValues {
  name: string;
  address: string;
  logoUrl: string;
}

interface CompanyProfileFormProps {
  values: CompanyProfileFormValues;
  onChange: (field: keyof CompanyProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const CompanyProfileForm = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: CompanyProfileFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="card-surface space-y-4 p-6"
    >
      <FormField label="Company name" htmlFor="company-name">
        <Input
          id="company-name"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Address" htmlFor="company-address">
        <Input
          id="company-address"
          value={values.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Street, city, country"
          icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Company logo URL" htmlFor="company-logo">
        <Input
          id="company-logo"
          type="url"
          value={values.logoUrl}
          onChange={(e) => onChange('logoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      {values.logoUrl ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
          <img
            src={values.logoUrl}
            alt="Company logo preview"
            className="max-h-16 max-w-[200px] object-contain"
          />
        </div>
      ) : null}

      <FormActions
        submitLabel="Save changes"
        loading={loading}
        loadingText="Saving…"
        submitDisabled={!hasChanges}
      />
    </form>
  );
};
