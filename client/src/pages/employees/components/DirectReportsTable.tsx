import { HiUserGroup } from 'react-icons/hi2';
import { Table } from '../../../components/ui/Table';
import { TablePageSizeControl } from '../../../components/ui/TablePagination';
import { usePagination } from '../../../hooks/usePagination';
import type { Employee } from '../../../types';
import { employeeName } from '../utils';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

interface DirectReportsTableProps {
  reports: Employee[];
  loading: boolean;
  onViewEmployee?: (employeeId: string) => void;
  embedded?: boolean;
}

export const DirectReportsTable = ({
  reports,
  loading,
  onViewEmployee,
  embedded = false,
}: DirectReportsTableProps) => {
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
  } = usePagination(reports);

  const table = (
    <>
      {!loading && total > 0 && (
        <TablePageSizeControl
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
        />
      )}
      <Table
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (row) =>
              onViewEmployee ? (
                <button
                  type="button"
                  onClick={() => onViewEmployee(row.id)}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {employeeName(row)}
                </button>
              ) : (
                employeeName(row)
              ),
          },
          {
            key: 'jobTitle',
            header: 'Job title',
            render: (row) => row.jobTitle ?? '—',
          },
          {
            key: 'department',
            header: 'Department',
            render: (row) => row.department ?? '—',
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <EmployeeStatusBadge status={row.status} />,
          },
        ]}
        data={paginatedItems}
        getRowKey={(row) => row.id}
        loading={loading}
        loadingMessage="Loading direct reports…"
        emptyMessage="No direct reports assigned to this employee."
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

  if (embedded) {
    return <div className="space-y-3 p-5">{table}</div>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <HiUserGroup className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-slate-900">Direct reports</h2>
      </div>
      {table}
    </section>
  );
};
