import { FormEvent } from "react";
import { HiGlobeAlt, HiHashtag, HiPhone, HiSignal } from "react-icons/hi2";
import { FormField } from "../../../../components/ui/FormField";
import { FormModal } from "../../../../components/ui/forms/FormModal";
import { Input } from "../../../../components/ui/Input";
import {
  DEFAULT_MAX_NATIONAL_LENGTH,
  DEFAULT_MIN_NATIONAL_LENGTH,
} from "../../../../utils/phone";

export interface CountryDialCodeFormValues {
  code: string;
  name: string;
  dialCode: string;
  minNationalLength: string;
  maxNationalLength: string;
}

interface CountryDialCodeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  title: string;
  description: string;
  submitLabel: string;
  values: CountryDialCodeFormValues;
  onChange: (field: keyof CountryDialCodeFormValues, value: string) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const CountryDialCodeFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  values,
  onChange,
  loading,
  submitDisabled,
}: CountryDialCodeFormModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      description={description}
      submitLabel={submitLabel}
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Country code" htmlFor="country-code">
          <Input
            id="country-code"
            value={values.code}
            onChange={(e) => onChange("code", e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="GB"
            required
            icon={<HiGlobeAlt className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Dial code" htmlFor="country-dial-code">
          <Input
            id="country-dial-code"
            value={values.dialCode}
            onChange={(e) =>
              onChange("dialCode", e.target.value.replace(/\D/g, ""))
            }
            placeholder="44"
            required
            icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>
      <FormField label="Country name" htmlFor="country-name">
        <Input
          id="country-name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Min national digits"
          htmlFor="country-min-national-length"
        >
          <Input
            id="country-min-national-length"
            type="number"
            min={1}
            max={15}
            value={values.minNationalLength}
            onChange={(e) =>
              onChange("minNationalLength", e.target.value.replace(/\D/g, ""))
            }
            required
            icon={<HiHashtag className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField
          label="Max national digits"
          htmlFor="country-max-national-length"
        >
          <Input
            id="country-max-national-length"
            type="number"
            min={1}
            max={15}
            value={values.maxNationalLength}
            onChange={(e) =>
              onChange("maxNationalLength", e.target.value.replace(/\D/g, ""))
            }
            required
            icon={<HiHashtag className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export const defaultCountryDialCodeFormValues =
  (): CountryDialCodeFormValues => ({
    code: "",
    name: "",
    dialCode: "",
    minNationalLength: String(DEFAULT_MIN_NATIONAL_LENGTH),
    maxNationalLength: String(DEFAULT_MAX_NATIONAL_LENGTH),
  });
