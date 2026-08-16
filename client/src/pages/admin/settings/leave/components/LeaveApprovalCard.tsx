import type { ReactNode } from "react";
import { HiPencilSquare, HiSignal } from "react-icons/hi2";
import { Button } from "../../../../../components/ui/Button";
import { APPROVAL_LABELS, type LeaveApprovalFormValues } from "../utils";

interface LeaveApprovalCardProps {
  values: LeaveApprovalFormValues;
  onEdit: () => void;
}

const iconClass = "h-4 w-4";

const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </dd>
    </div>
  </div>
);

export const LeaveApprovalCard = ({
  values,
  onEdit,
}: LeaveApprovalCardProps) => (
  <section className="card-surface overflow-hidden">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Approval workflow
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          How leave requests are approved.
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
        onClick={onEdit}
      >
        Edit
      </Button>
    </div>

    <dl className="space-y-5 p-5">
      <DetailItem
        label="Multi-step approval"
        value={APPROVAL_LABELS[values.multiStepApprovalEnabled] ?? "—"}
        icon={<HiSignal className={iconClass} />}
      />
    </dl>
  </section>
);
