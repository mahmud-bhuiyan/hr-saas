import { useState } from "react";
import { HiCheck, HiXMark, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import { FormField } from "../../../../components/ui/FormField";
import { Modal } from "../../../../components/ui/Modal";
import { Table } from "../../../../components/ui/primitives/Table";
import { TablePageSizeControl } from "../../../../components/ui/primitives/TablePagination";
import { usePagination } from "../../../../hooks/usePagination";
import { Textarea } from "../../../../components/ui/Textarea";
import type { LeaveRequest } from "../../../../types";
import { formatDateRange, leaveTypeLabel, approvalStepLabel } from "../utils";
import { LeaveOverlapIndicator } from "./LeaveOverlapIndicator";
import { LeaveShiftConflictIndicator } from "./LeaveShiftConflictIndicator";

interface LeaveApprovalQueueProps {
  requests: LeaveRequest[];
  loading: boolean;
  multiStepApprovalEnabled?: boolean;
  onApprove: (request: LeaveRequest) => void;
  onDecline: (request: LeaveRequest, reason?: string) => void;
  actionLoadingId: string | null;
}

export const LeaveApprovalQueue = ({
  requests,
  loading,
  multiStepApprovalEnabled = false,
  onApprove,
  onDecline,
  actionLoadingId,
}: LeaveApprovalQueueProps) => {
  const [declineTarget, setDeclineTarget] = useState<LeaveRequest | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const {
    paginatedItems,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    pageSizeOptions,
  } = usePagination(requests);

  const handleDeclineSubmit = () => {
    if (!declineTarget) return;
    onDecline(declineTarget, declineReason.trim() || undefined);
    setDeclineTarget(null);
    setDeclineReason("");
  };

  const handleApproveClick = (request: LeaveRequest) => {
    if (request.conflictingShifts?.length) {
      setApproveTarget(request);
      return;
    }

    onApprove(request);
  };

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    onApprove(approveTarget);
    setApproveTarget(null);
  };

  return (
    <>
      {!loading && total > 0 && (
        <TablePageSizeControl
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
          className="mb-3"
        />
      )}
      <Table
        loading={loading}
        emptyMessage="No pending leave requests."
        data={paginatedItems}
        getRowKey={(row) => row.id}
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row: LeaveRequest) =>
              `${row.employee.firstName} ${row.employee.lastName}`,
          },
          {
            key: "type",
            header: "Type",
            render: (row: LeaveRequest) => leaveTypeLabel(row.type),
          },
          {
            key: "dates",
            header: "Dates",
            render: (row: LeaveRequest) =>
              formatDateRange(row.startDate, row.endDate, row.halfDay),
          },
          {
            key: "days",
            header: "Days",
            render: (row: LeaveRequest) => row.days,
          },
          {
            key: "step",
            header: "Approval step",
            render: (row: LeaveRequest) => {
              const label = approvalStepLabel(row, multiStepApprovalEnabled);
              return label ? (
                <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
                  {label}
                </span>
              ) : (
                "—"
              );
            },
          },
          {
            key: "reason",
            header: "Reason",
            render: (row: LeaveRequest) => row.reason || "—",
          },
          {
            key: "overlaps",
            header: "Same dates",
            align: "left",
            render: (row: LeaveRequest) => (
              <LeaveOverlapIndicator overlaps={row.overlappingRequests} />
            ),
          },
          {
            key: "shifts",
            header: "Rota clash",
            align: "left",
            render: (row: LeaveRequest) => (
              <LeaveShiftConflictIndicator conflicts={row.conflictingShifts} />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (row: LeaveRequest) => (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiCheck className="h-4 w-4 text-white" />}
                  loading={actionLoadingId === row.id}
                  loadingText={
                    row.approvalStep === 2 ? "Approving…" : "Approving…"
                  }
                  onClick={() => handleApproveClick(row)}
                >
                  {multiStepApprovalEnabled && row.approvalStep === 2
                    ? "Final approve"
                    : multiStepApprovalEnabled && row.approvalStep === 1
                      ? "Approve step 1"
                      : "Approve"}
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
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
          rangeStart,
          rangeEnd,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions,
        }}
      />

      <Modal
        open={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        title="Decline leave request"
        description={
          declineTarget
            ? `Decline ${declineTarget.employee.firstName} ${declineTarget.employee.lastName}'s request?`
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
              Decline request
            </Button>
          </div>
        }
      >
        <FormField label="Reason (optional)" htmlFor="decline-reason">
          <Textarea
            id="decline-reason"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            icon={
              <HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />
            }
          />
        </FormField>
      </Modal>

      <Modal
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title="Approve leave with rota clash"
        description={
          approveTarget
            ? `${approveTarget.employee.firstName} ${approveTarget.employee.lastName} has scheduled shifts during this leave. Reassign or remove those shifts after approval.`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setApproveTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              icon={<HiCheck className="h-4 w-4 text-white" />}
              loading={Boolean(
                approveTarget && actionLoadingId === approveTarget.id,
              )}
              loadingText="Approving…"
              onClick={handleApproveConfirm}
            >
              Approve anyway
            </Button>
          </div>
        }
      >
        {approveTarget?.conflictingShifts?.length ? (
          <LeaveShiftConflictIndicator
            conflicts={approveTarget.conflictingShifts}
          />
        ) : null}
      </Modal>
    </>
  );
};
