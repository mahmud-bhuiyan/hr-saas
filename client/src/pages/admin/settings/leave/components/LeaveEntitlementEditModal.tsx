import type { FormEvent } from "react";
import { HiCalendarDays } from "react-icons/hi2";
import { FormModal } from "../../../../../components/ui/forms/FormModal";
import { InputField } from "../../../../../components/ui/formFields";
import type { LeaveEntitlementFormValues } from "../utils";

interface LeaveEntitlementEditModalProps {
  open: boolean;
  onClose: () => void;
  values: LeaveEntitlementFormValues;
  onChange: <K extends keyof LeaveEntitlementFormValues>(
    field: K,
    value: LeaveEntitlementFormValues[K],
  ) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const LeaveEntitlementEditModal = ({
  open,
  onClose,
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: LeaveEntitlementEditModalProps) => (
  <FormModal
    open={open}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Edit leave entitlement"
    description="Update annual entitlement and carry-over limits."
    submitLabel="Save changes"
    loading={loading}
    submitDisabled={!hasChanges || loading}
  >
    <InputField
      label="Annual entitlement (days)"
      htmlFor="annual-entitlement"
      id="annual-entitlement"
      type="number"
      min={0}
      max={365}
      value={values.annualEntitlement}
      onChange={(event) => onChange("annualEntitlement", event.target.value)}
      icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
      description="Pro-rata applies automatically for mid-year starters based on employee start date."
      disabled={loading}
    />

    <InputField
      label="Max carry-over days"
      htmlFor="max-carry-over"
      id="max-carry-over"
      type="number"
      min={0}
      max={365}
      value={values.maxCarryOverDays}
      onChange={(event) => onChange("maxCarryOverDays", event.target.value)}
      icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
      disabled={loading}
    />
  </FormModal>
);
