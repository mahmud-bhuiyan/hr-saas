import { FormEvent } from "react";
import {
  HiCalendarDays,
  HiChatBubbleLeftEllipsis,
  HiSignal,
} from "react-icons/hi2";
import { FormField } from "../../../../components/ui/FormField";
import { FormModal } from "../../../../components/ui/forms/FormModal";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Textarea } from "../../../../components/ui/Textarea";
import type { CreateLeaveRequestInput, LeaveType } from "../../../../types";

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CreateLeaveRequestInput;
  onFormChange: (
    updater: (prev: CreateLeaveRequestInput) => CreateLeaveRequestInput,
  ) => void;
  loading: boolean;
  submitDisabled: boolean;
}

const typeOptions: Array<{ value: LeaveType; label: string }> = [
  { value: "planned", label: "Planned leave" },
  { value: "unplanned", label: "Unplanned leave" },
  { value: "unpaid", label: "Unpaid leave" },
];

export const LeaveRequestModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  loading,
  submitDisabled,
}: LeaveRequestModalProps) => {
  const isSingleDay =
    form.startDate && form.endDate && form.startDate === form.endDate;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Request leave"
      description="Submit a leave request for approval."
      submitLabel="Submit request"
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <FormField label="Leave type" htmlFor="leave-type" required>
        <Select
          id="leave-type"
          value={form.type}
          onChange={(e) =>
            onFormChange((f) => ({ ...f, type: e.target.value as LeaveType }))
          }
          required
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="leave-startDate" required>
          <Input
            id="leave-startDate"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, startDate: e.target.value }))
            }
            required
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="End date" htmlFor="leave-endDate" required>
          <Input
            id="leave-endDate"
            type="date"
            value={form.endDate}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, endDate: e.target.value }))
            }
            required
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      {isSingleDay && (
        <FormField label="Half day" htmlFor="leave-halfDay">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              id="leave-halfDay"
              type="checkbox"
              checked={form.halfDay ?? false}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, halfDay: e.target.checked }))
              }
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            This is a half-day request
          </label>
        </FormField>
      )}

      <FormField label="Reason" htmlFor="leave-reason" required>
        <Textarea
          id="leave-reason"
          value={form.reason}
          onChange={(e) =>
            onFormChange((f) => ({ ...f, reason: e.target.value }))
          }
          rows={3}
          required
          icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
