import { Link } from 'react-router-dom';
import { Table } from '../../../components/ui/Table';
import type { Employee } from '../../../types';
import { employeeName } from '../utils';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
}

export const EmployeesTable = ({ employees, loading }: EmployeesTableProps) => {
  return (
    <Table
      columns={[
        {
          key: 'name',
          header: 'Name',
          render: (row) => (
            <Link
              to={`/dashboard/employees/${row.id}`}
              className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
            >
              {employeeName(row)}
            </Link>
          ),
        },
        {
          key: 'employeeNumber',
          header: 'ID',
          render: (row) => (
            <span className="font-mono text-xs text-slate-500">{row.employeeNumber}</span>
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
          key: 'manager',
          header: 'Manager',
          render: (row) =>
            row.manager ? `${row.manager.firstName} ${row.manager.lastName}` : '—',
        },
        {
          key: 'status',
          header: 'Status',
          render: (row) => <EmployeeStatusBadge status={row.status} />,
        },
      ]}
      data={employees}
      getRowKey={(row) => row.id}
      loading={loading}
      loadingMessage="Loading employees…"
      emptyMessage="No employees match your filters."
    />
  );
}
