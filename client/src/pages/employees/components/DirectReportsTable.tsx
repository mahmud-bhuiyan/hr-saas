import { Link } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi2';
import { Table } from '../../../components/ui/Table';
import type { Employee } from '../../../types';
import { employeeName } from '../utils';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

interface DirectReportsTableProps {
  reports: Employee[];
  loading: boolean;
}

export const DirectReportsTable = ({ reports, loading }: DirectReportsTableProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <HiUserGroup className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-slate-900">Direct reports</h2>
      </div>
      <Table
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (row) => (
              <Link
                to={`/dashboard/employees/${row.id}`}
                className="font-medium text-brand-700 hover:underline"
              >
                {employeeName(row)}
              </Link>
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
        data={reports}
        getRowKey={(row) => row.id}
        loading={loading}
        loadingMessage="Loading direct reports…"
        emptyMessage="No direct reports assigned to this employee."
      />
    </section>
  );
}
