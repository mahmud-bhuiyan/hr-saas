import type { ReactNode } from "react";
import { HiCalendarDays, HiPencilSquare } from "react-icons/hi2";
import { Button } from "../../../../../components/ui/Button";
import type { LeaveEntitlementFormValues } from "../utils";

interface LeaveEntitlementCardProps {
  values: LeaveEntitlementFormValues;
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

export const LeaveEntitlementCard = ({
  values,
  onEdit,
}: LeaveEntitlementCardProps) => (
  <section className="card-surface overflow-hidden">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Leave entitlement
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Planned, unplanned, and unpaid days plus carry-over limits.
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

    <dl className="grid gap-5 p-5 sm:grid-cols-2">
      <DetailItem
        label="Planned leave (days)"
        value={values.plannedLeaveEntitlement}
        icon={<HiCalendarDays className={iconClass} />}
      />
      <DetailItem
        label="Unplanned leave (days)"
        value={values.unplannedLeaveEntitlement}
        icon={<HiCalendarDays className={iconClass} />}
      />
      <DetailItem
        label="Unpaid leave (days)"
        value={values.unpaidLeaveEntitlement}
        icon={<HiCalendarDays className={iconClass} />}
      />
      <DetailItem
        label="Max carry-over days"
        value={values.maxCarryOverDays}
        icon={<HiCalendarDays className={iconClass} />}
      />
    </dl>
  </section>
);
