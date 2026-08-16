import type { FormEvent } from "react";
import { HiBanknotes } from "react-icons/hi2";
import { FormModal } from "../../../../../components/ui/forms/FormModal";
import { InputField } from "../../../../../components/ui/formFields";
import type { XeroAccountCodesFormValues } from "../utils";

interface XeroAccountCodesEditModalProps {
  open: boolean;
  onClose: () => void;
  values: XeroAccountCodesFormValues;
  onChange: <K extends keyof XeroAccountCodesFormValues>(
    field: K,
    value: XeroAccountCodesFormValues[K],
  ) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const XeroAccountCodesEditModal = ({
  open,
  onClose,
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: XeroAccountCodesEditModalProps) => (
  <FormModal
    open={open}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Edit Xero account codes"
    description="Update chart of accounts codes used when syncing payroll as a manual journal."
    submitLabel="Save changes"
    loading={loading}
    submitDisabled={!hasChanges || loading}
  >
    <InputField
      label="Wages expense account"
      htmlFor="xero-expense-account"
      id="xero-expense-account"
      value={values.xeroExpenseAccountCode}
      onChange={(event) =>
        onChange("xeroExpenseAccountCode", event.target.value)
      }
      icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
      disabled={loading}
    />

    <InputField
      label="Wages payable account"
      htmlFor="xero-payable-account"
      id="xero-payable-account"
      value={values.xeroPayableAccountCode}
      onChange={(event) =>
        onChange("xeroPayableAccountCode", event.target.value)
      }
      icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
      disabled={loading}
    />
  </FormModal>
);
