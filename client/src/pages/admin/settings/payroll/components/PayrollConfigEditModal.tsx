import type { FormEvent } from "react";
import { HiBanknotes, HiCalendarDays, HiSignal } from "react-icons/hi2";
import { FormModal } from "../../../../../components/ui/forms/FormModal";
import {
  InputField,
  SelectField,
} from "../../../../../components/ui/formFields";
import type { PayPeriodType } from "../../../../../types";
import { WEEKDAY_OPTIONS, type PayrollConfigFormValues } from "../utils";

interface PayrollConfigEditModalProps {
  open: boolean;
  onClose: () => void;
  values: PayrollConfigFormValues;
  onChange: <K extends keyof PayrollConfigFormValues>(
    field: K,
    value: PayrollConfigFormValues[K],
  ) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const PayrollConfigEditModal = ({
  open,
  onClose,
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: PayrollConfigEditModalProps) => (
  <FormModal
    open={open}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Edit payroll configuration"
    description="Update pay period type, currency, and week start day."
    submitLabel="Save changes"
    loading={loading}
    submitDisabled={!hasChanges || loading}
  >
    <SelectField
      label="Pay period type"
      value={values.payPeriodType}
      onChange={(event) =>
        onChange("payPeriodType", event.target.value as PayPeriodType)
      }
      icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
      disabled={loading}
      options={[
        { value: "weekly", label: "Weekly" },
        { value: "biweekly", label: "Biweekly" },
        { value: "monthly", label: "Monthly" },
      ]}
    />

    <InputField
      label="Default pay currency"
      htmlFor="pay-currency"
      id="pay-currency"
      value={values.defaultPayCurrency}
      onChange={(event) =>
        onChange("defaultPayCurrency", event.target.value.toUpperCase())
      }
      maxLength={3}
      icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
      disabled={loading}
    />

    <SelectField
      label="Payroll week starts on"
      value={values.payrollWeekStartDay}
      onChange={(event) => onChange("payrollWeekStartDay", event.target.value)}
      icon={<HiSignal className="h-4 w-4 text-brand-600" />}
      disabled={loading}
      options={WEEKDAY_OPTIONS}
    />
  </FormModal>
);
