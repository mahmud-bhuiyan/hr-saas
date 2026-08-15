import type { FormEvent } from "react";
import { HiCalendarDays } from "react-icons/hi2";
import { FormField } from "../../../../components/ui/FormField";
import { FormModal } from "../../../../components/ui/forms/FormModal";
import { Input } from "../../../../components/ui/Input";

export type CreatePayrollPeriodForm = {
  periodStart: string;
  periodEnd: string;
};

interface CreatePayrollPeriodModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CreatePayrollPeriodForm;
  onFormChange: (next: CreatePayrollPeriodForm) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const CreatePayrollPeriodModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  loading,
  submitDisabled,
}: CreatePayrollPeriodModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Create payroll period"
      description="Define the date range for this payroll run. Defaults follow your payroll settings."
      submitLabel="Create period"
      loading={loading}
      submitDisabled={submitDisabled}
      formId="create-payroll-period-form"
    >
      <div className="space-y-4">
        <FormField label="Period start" htmlFor="payroll-period-start">
          <Input
            id="payroll-period-start"
            type="date"
            value={form.periodStart}
            onChange={(event) =>
              onFormChange({ ...form, periodStart: event.target.value })
            }
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Period end" htmlFor="payroll-period-end">
          <Input
            id="payroll-period-end"
            type="date"
            value={form.periodEnd}
            onChange={(event) =>
              onFormChange({ ...form, periodEnd: event.target.value })
            }
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>
    </FormModal>
  );
};
