import type { Employee } from '../../../types';
import { personName } from '../utils';
import { SummaryItem } from './SummaryItem';

interface EmployeeProfileSummaryProps {
  employee: Employee;
}

export const EmployeeProfileSummary = ({ employee }: EmployeeProfileSummaryProps) => {
  return (
    <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
      <SummaryItem
        label="Manager"
        value={employee.manager ? personName(employee.manager) : '—'}
      />
      <SummaryItem
        label="Member since"
        value={new Date(employee.createdAt).toLocaleDateString()}
      />
      <SummaryItem
        label="Last updated"
        value={new Date(employee.updatedAt).toLocaleDateString()}
      />
      {employee.startDate && (
        <SummaryItem
          label="Start date"
          value={new Date(employee.startDate).toLocaleDateString()}
        />
      )}
    </dl>
  );
}
