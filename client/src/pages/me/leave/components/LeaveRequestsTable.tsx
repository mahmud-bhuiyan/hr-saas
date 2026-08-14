import { HiXMark } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { Table } from '../../../../components/ui/Table';
import { TablePageSizeControl } from '../../../../components/ui/TablePagination';
import { usePagination } from '../../../../hooks/usePagination';
import type { LeaveRequest } from '../../../../types';
import { formatDateRange, leaveStatusClass, leaveStatusLabel, leaveTypeLabel } from '../utils';
import { LeaveOverlapIndicator } from './LeaveOverlapIndicator';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  loading: boolean;
  emptyMessage?: string;
  showEmployee?: boolean;
  showOverlaps?: boolean;
  onCancel?: (request: LeaveRequest) => void;
  cancelLoadingId?: string | null;
}

export const LeaveRequestsTable = ({
  requests,
  loading,
  emptyMessage = 'No leave requests yet.',
  showEmployee = false,
  showOverlaps = false,
  onCancel,
  cancelLoadingId,
}: LeaveRequestsTableProps) => {
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
      emptyMessage={emptyMessage}
      data={paginatedItems}
      getRowKey={(row) => row.id}
      columns={[
        ...(showEmployee
          ? [
              {
                key: 'employee',
                header: 'Employee',
                render: (row: LeaveRequest) =>
                  `${row.employee.firstName} ${row.employee.lastName}`,
              },
            ]
          : []),
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
          key: 'status',
          header: 'Status',
          render: (row: LeaveRequest) => (
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${leaveStatusClass(row.status)}`}
            >
              {leaveStatusLabel(row.status)}
            </span>
          ),
        },
        {
          key: 'reason',
          header: 'Reason',
          render: (row: LeaveRequest) => row.reason || '—',
        },
        ...(showOverlaps
          ? [
              {
                key: 'overlaps',
                header: 'Overlaps',
                align: 'left' as const,
                render: (row: LeaveRequest) => (
                  <LeaveOverlapIndicator overlaps={row.overlappingRequests} />
                ),
              },
            ]
          : []),
        ...(onCancel
          ? [
              {
                key: 'actions',
                header: 'Actions',
                align: 'right' as const,
                render: (row: LeaveRequest) =>
                  row.status === 'pending' ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-1.5 text-xs"
                        icon={<HiXMark className="h-4 w-4 text-red-500" />}
                        loading={cancelLoadingId === row.id}
                        loadingText="Cancelling…"
                        onClick={() => onCancel(row)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]
          : []),
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
    </>
  );
};
