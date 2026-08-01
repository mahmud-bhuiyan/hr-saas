import { useState } from 'react';
import { HiCheck, HiXMark, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Modal } from '../../../components/ui/Modal';
import { Table } from '../../../components/ui/Table';
import { TablePageSizeControl } from '../../../components/ui/TablePagination';
import { usePagination } from '../../../hooks/usePagination';
import { Textarea } from '../../../components/ui/Textarea';
import type { LeaveRequest } from '../../../types';
import { formatDateRange, leaveTypeLabel } from '../utils';

interface LeaveApprovalQueueProps {
  requests: LeaveRequest[];
  loading: boolean;
  onApprove: (request: LeaveRequest) => void;
  onDecline: (request: LeaveRequest, reason?: string) => void;
  actionLoadingId: string | null;
}

export const LeaveApprovalQueue = ({
  requests,
  loading,
  onApprove,
  onDecline,
  actionLoadingId,
}: LeaveApprovalQueueProps) => {
  const [declineTarget, setDeclineTarget] = useState<LeaveRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('');
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
    setDeclineReason('');
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
            key: 'employee',
            header: 'Employee',
            render: (row: LeaveRequest) =>
              `${row.employee.firstName} ${row.employee.lastName}`,
          },
          {
            key: 'type',
            header: 'Type',
            render: (row: LeaveRequest) => leaveTypeLabel(row.type),
          },
          {
            key: 'dates',
            header: 'Dates',
            render: (row: LeaveRequest) => formatDateRange(row.startDate, row.endDate, row.halfDay),
          },
          {
            key: 'days',
            header: 'Days',
            render: (row: LeaveRequest) => row.days,
          },
          {
            key: 'reason',
            header: 'Reason',
            render: (row: LeaveRequest) => row.reason || '—',
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row: LeaveRequest) => (
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
                    setDeclineReason('');
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
            <Button type="button" variant="secondary" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={<HiXMark className="h-4 w-4 text-red-500" />}
              loading={Boolean(declineTarget && actionLoadingId === declineTarget.id)}
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
            icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </Modal>
    </>
  );
};
