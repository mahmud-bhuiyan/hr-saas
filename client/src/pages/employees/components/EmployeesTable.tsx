import { useMemo } from 'react';
import {
  HiCheckCircle,
  HiEye,
  HiPencilSquare,
  HiXCircle,
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Table, type TableSortState } from '../../../components/ui/Table';
import type { TablePaginationConfig } from '../../../components/ui/TablePagination';
import type { Employee } from '../../../types';
import { employeeName } from '../utils';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
  pagination?: TablePaginationConfig;
  emptyMessage?: string;
  showStatus?: boolean;
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  canUpdate?: boolean;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDeactivate?: (employee: Employee) => void;
  onActivate?: (employee: Employee) => void;
  deactivateLoadingId?: string | null;
  activateLoadingId?: string | null;
}

export const EmployeesTable = ({
  employees,
  loading,
  pagination,
  emptyMessage = 'No employees match your filters.',
  showStatus = false,
  sort,
  onSortChange,
  canUpdate = false,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  deactivateLoadingId,
  activateLoadingId,
}: EmployeesTableProps) => {
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        width: showStatus ? 15 : 17,
        render: (row: Employee) => (
          <button
            type="button"
            onClick={() => onView?.(row)}
            className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            {employeeName(row)}
          </button>
        ),
      },
      {
        key: 'jobTitle',
        header: 'Job title',
        sortable: true,
        width: showStatus ? 15 : 17,
        render: (row: Employee) => row.jobTitle ?? '—',
      },
      {
        key: 'department',
        header: 'Department',
        sortable: true,
        width: showStatus ? 15 : 17,
        render: (row: Employee) => row.department ?? '—',
      },
      {
        key: 'manager',
        header: 'Manager',
        sortable: true,
        width: showStatus ? 15 : 18,
        render: (row: Employee) =>
          row.manager ? `${row.manager.firstName} ${row.manager.lastName}` : '—',
      },
    ];

    if (showStatus) {
      baseColumns.push({
        key: 'status',
        header: 'Status',
        sortable: false,
        width: 10,
        render: (row: Employee) => <EmployeeStatusBadge status={row.status} />,
      });
    }

    baseColumns.push({
      key: 'actions',
      header: 'Actions',
      sortable: false,
      width: 30,
      render: (row: Employee) => (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            display="both"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => onView?.(row)}
            icon={<HiEye className="h-4 w-4 text-brand-600" />}
          >
            View
          </Button>
          {canUpdate && (
            <>
              <Button
                display="both"
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() => onEdit?.(row)}
                icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
              >
                Edit
              </Button>
              {row.status !== 'terminated' && onDeactivate && (
                <Button
                  display="both"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  loading={deactivateLoadingId === row.id}
                  loadingText="Deactivating…"
                  disabled={Boolean(deactivateLoadingId && deactivateLoadingId !== row.id)}
                  onClick={() => onDeactivate(row)}
                  icon={<HiXCircle className="h-4 w-4 text-amber-600" />}
                >
                  Deactivate
                </Button>
              )}
              {row.status !== 'active' && onActivate && (
                <Button
                  display="both"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  loading={activateLoadingId === row.id}
                  loadingText="Activating…"
                  disabled={Boolean(activateLoadingId && activateLoadingId !== row.id)}
                  onClick={() => onActivate(row)}
                  icon={<HiCheckCircle className="h-4 w-4 text-green-600" />}
                >
                  Activate
                </Button>
              )}
            </>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [
    activateLoadingId,
    canUpdate,
    deactivateLoadingId,
    onActivate,
    onDeactivate,
    onEdit,
    onView,
    showStatus,
    sort,
    onSortChange,
  ]);

  return (
    <Table
      columns={columns}
      data={employees}
      getRowKey={(row) => row.id}
      loading={loading}
      loadingMessage="Loading employees…"
      emptyMessage={emptyMessage}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
    />
  );
};
