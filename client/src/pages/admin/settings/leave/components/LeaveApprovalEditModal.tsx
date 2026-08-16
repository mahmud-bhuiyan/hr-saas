import type { FormEvent } from "react";
import { HiSignal } from "react-icons/hi2";
import { FormModal } from "../../../../../components/ui/forms/FormModal";
import { SelectField } from "../../../../../components/ui/formFields";
import { APPROVAL_OPTIONS, type LeaveApprovalFormValues } from "../utils";

interface LeaveApprovalEditModalProps {
  open: boolean;
  onClose: () => void;
  values: LeaveApprovalFormValues;
  onChange: <K extends keyof LeaveApprovalFormValues>(
    field: K,
    value: LeaveApprovalFormValues[K],
  ) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const LeaveApprovalEditModal = ({
  open,
  onClose,
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: LeaveApprovalEditModalProps) => (
  <FormModal
    open={open}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Edit approval workflow"
    description="Choose how leave requests are approved."
    submitLabel="Save changes"
    loading={loading}
    submitDisabled={!hasChanges || loading}
  >
    <SelectField
      label="Multi-step approval"
      value={values.multiStepApprovalEnabled}
      onChange={(event) =>
        onChange("multiStepApprovalEnabled", event.target.value)
      }
      icon={<HiSignal className="h-4 w-4 text-brand-600" />}
      description="When enabled, managers approve step 1 and HR gives final approval on step 2."
      disabled={loading}
      options={APPROVAL_OPTIONS}
    />
  </FormModal>
);
