import type { Employee } from '../../../types';
import { SummaryItem } from './SummaryItem';

interface EmployeeReadOnlyDetailsProps {
  employee: Employee;
}

export const EmployeeReadOnlyDetails = ({ employee }: EmployeeReadOnlyDetailsProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Contact & employment</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Email" value={employee.email ?? '—'} />
        <SummaryItem label="Phone" value={employee.phone ?? '—'} />
        <SummaryItem label="Job title" value={employee.jobTitle ?? '—'} />
        <SummaryItem label="Department" value={employee.department ?? '—'} />
      </dl>
    </section>
  );
}
