import { FormEvent } from "react";
import { HiBuildingOffice2, HiMapPin, HiPhone } from "react-icons/hi2";
import { FormActions } from "../../../../../components/ui/FormActions";
import { FormField } from "../../../../../components/ui/FormField";
import { Input } from "../../../../../components/ui/Input";
import { Select } from "../../../../../components/ui/Select";
import type { CountryDialCode } from "../../../../../utils/phone";

export interface CompanyProfileFormValues {
  name: string;
  address: string;
  logoUrl: string;
  defaultPhoneDialCode: string;
}

interface CompanyProfileFormProps {
  values: CompanyProfileFormValues;
  dialCodeOptions: CountryDialCode[];
  onChange: (field: keyof CompanyProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const CompanyProfileForm = ({
  values,
  dialCodeOptions,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: CompanyProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
      <FormField label="Company name" htmlFor="company-name">
        <Input
          id="company-name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Address" htmlFor="company-address">
        <Input
          id="company-address"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Street, city, country"
          icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField
        label="Default phone country code"
        htmlFor="company-default-phone-dial-code"
      >
        <Select
          id="company-default-phone-dial-code"
          value={values.defaultPhoneDialCode}
          onChange={(e) => onChange("defaultPhoneDialCode", e.target.value)}
          icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          searchable
          searchPlaceholder="Search country or code"
        >
          {dialCodeOptions.map((country) => (
            <option key={country.dialCode} value={country.dialCode}>
              +{country.dialCode} — {country.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Company logo URL" htmlFor="company-logo">
        <Input
          id="company-logo"
          type="url"
          value={values.logoUrl}
          onChange={(e) => onChange("logoUrl", e.target.value)}
          placeholder="https://example.com/logo.png"
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      {values.logoUrl ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Preview
          </p>
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
