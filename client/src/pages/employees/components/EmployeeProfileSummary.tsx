import {
  HiBriefcase,
  HiCalendarDays,
  HiEnvelope,
  HiIdentification,
  HiPhone,
  HiRectangleGroup,
  HiUserGroup,
} from 'react-icons/hi2';
import type { Employee } from '../../../types';
import { formatDateTime } from '../utils';
import { SummaryItem } from './SummaryItem';

interface EmployeeProfileSummaryProps {
  employee: Employee;
  showMetadata?: boolean;
}

const iconClass = 'h-4 w-4';

export const EmployeeProfileSummary = ({ employee, showMetadata = false }: EmployeeProfileSummaryProps) => {
  const managerName = employee.manager
    ? `${employee.manager.firstName} ${employee.manager.lastName}`
    : '—';

  return (
    <section className="card-surface overflow-hidden">
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <SummaryItem
          label="Email"
          value={employee.email ?? '—'}
          icon={<HiEnvelope className={iconClass} />}
        />
        <SummaryItem
          label="Phone"
          value={employee.phone ?? '—'}
          icon={<HiPhone className={iconClass} />}
        />
        <SummaryItem
          label="Job title"
          value={employee.jobTitle ?? '—'}
          icon={<HiBriefcase className={iconClass} />}
        />
        <SummaryItem
          label="Department"
          value={employee.department ?? '—'}
          icon={<HiRectangleGroup className={iconClass} />}
        />
        <SummaryItem
          label="Manager"
          value={managerName}
          icon={<HiUserGroup className={iconClass} />}
        />
        <SummaryItem
          label="Start date"
          value={employee.startDate ? new Date(employee.startDate).toLocaleDateString() : '—'}
          icon={<HiCalendarDays className={iconClass} />}
        />
      </div>

      {showMetadata && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Record details
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryItem
              label="Employee ID"
              value={employee.employeeNumber}
              icon={<HiIdentification className={iconClass} />}
            />
            <SummaryItem label="Created at" value={formatDateTime(employee.createdAt)} />
            <SummaryItem label="Created by" value={employee.createdByName ?? '—'} />
            <SummaryItem label="Updated at" value={formatDateTime(employee.updatedAt)} />
            <SummaryItem label="Updated by" value={employee.updatedByName ?? '—'} />
          </dl>
        </div>
      )}
    </section>
  );
};
