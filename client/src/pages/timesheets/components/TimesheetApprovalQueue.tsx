import { useState } from "react";
import { HiCheck, HiXMark, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/ui/FormField";
import { Modal } from "../../../components/ui/Modal";
import { Table } from "../../../components/ui/primitives/Table";
import { Textarea } from "../../../components/ui/Textarea";
import type { Timesheet } from "../../../types";
import { formatWeekRange } from "../utils";

interface TimesheetApprovalQueueProps {
  timesheets: Timesheet[];
  loading: boolean;
  onApprove: (timesheet: Timesheet) => void;
  onDecline: (timesheet: Timesheet, reason?: string) => void;
  actionLoadingId: string | null;
}

export const TimesheetApprovalQueue = ({
  timesheets,
  loading,
  onApprove,
  onDecline,
  actionLoadingId,
}: TimesheetApprovalQueueProps) => {
  const [declineTarget, setDeclineTarget] = useState<Timesheet | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const handleDeclineSubmit = () => {
    if (!declineTarget) {
      return;
    }
    onDecline(declineTarget, declineReason.trim() || undefined);
    setDeclineTarget(null);
    setDeclineReason("");
  };

  return (
    <>
      <Table
        loading={loading}
        emptyMessage="No submitted timesheets."
        data={timesheets}
        getRowKey={(row) => row.id}
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row: Timesheet) =>
              row.employee
                ? `${row.employee.firstName} ${row.employee.lastName}`
                : "—",
          },
          {
            key: "week",
            header: "Week",
            render: (row: Timesheet) => formatWeekRange(row.weekOf),
          },
          {
            key: "totalHours",
            header: "Total",
            render: (row: Timesheet) => `${row.totalHours.toFixed(2)}h`,
          },
          {
            key: "overtime",
            header: "Overtime",
            render: (row: Timesheet) => (
              <span
                className={
                  row.overtimeHours > 0 ? "font-medium text-amber-600" : ""
                }
              >
                {row.overtimeHours.toFixed(2)}h
              </span>
            ),
          },
          {
            key: "submittedAt",
            header: "Submitted",
            render: (row: Timesheet) =>
              row.submittedAt
                ? new Date(row.submittedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—",
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (row: Timesheet) => (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiCheck className="h-4 w-4 text-white" />}
                  loading={actionLoadingId === row.id}
                  loadingText="Approving…"
                  onClick={() => onApprove(row)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiXMark className="h-4 w-4 text-red-500" />}
                  disabled={actionLoadingId === row.id}
                  onClick={() => {
                    setDeclineTarget(row);
                    setDeclineReason("");
                  }}
                >
                  Decline
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        title="Decline timesheet"
        description={
          declineTarget?.employee
            ? `Decline ${declineTarget.employee.firstName} ${declineTarget.employee.lastName}'s timesheet?`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeclineTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={<HiXMark className="h-4 w-4 text-red-500" />}
              loading={Boolean(
                declineTarget && actionLoadingId === declineTarget.id,
              )}
              loadingText="Declining…"
              onClick={handleDeclineSubmit}
            >
              Decline timesheet
            </Button>
          </div>
        }
      >
        <FormField label="Reason (optional)" htmlFor="decline-timesheet-reason">
          <Textarea
            id="decline-timesheet-reason"
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            rows={3}
            icon={
              <HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />
            }
          />
        </FormField>
      </Modal>
    </>
  );
};
