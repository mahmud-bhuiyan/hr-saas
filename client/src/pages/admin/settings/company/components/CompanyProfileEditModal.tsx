import type { FormEvent } from "react";
import { HiBuildingOffice2, HiMapPin, HiPhone } from "react-icons/hi2";
import { FormField } from "../../../../../components/ui/FormField";
import { FormModal } from "../../../../../components/ui/forms/FormModal";
import { Input } from "../../../../../components/ui/Input";
import { Select } from "../../../../../components/ui/Select";
import { Textarea } from "../../../../../components/ui/Textarea";
import type { CountryDialCode } from "../../../../../utils/phone";

export interface CompanyProfileFormValues {
  name: string;
  address: string;
  defaultPhoneDialCode: string;
}

interface CompanyProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  values: CompanyProfileFormValues;
  dialCodeOptions: CountryDialCode[];
  onChange: (field: keyof CompanyProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const CompanyProfileEditModal = ({
  open,
  onClose,
  values,
  dialCodeOptions,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: CompanyProfileEditModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Edit company profile"
      description="Update your company name, address, and default phone country code."
      submitLabel="Save changes"
      loading={loading}
      submitDisabled={!hasChanges || loading}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company name" htmlFor="company-name">
          <Input
            id="company-name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
            icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
            disabled={loading}
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
            disabled={loading}
          >
            {dialCodeOptions.map((country) => (
              <option key={country.dialCode} value={country.dialCode}>
                +{country.dialCode} — {country.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Address"
          htmlFor="company-address"
          className="sm:col-span-2"
        >
          <Textarea
            id="company-address"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Street, city, country"
            rows={3}
            icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
            disabled={loading}
          />
        </FormField>
      </div>
    </FormModal>
  );
};
