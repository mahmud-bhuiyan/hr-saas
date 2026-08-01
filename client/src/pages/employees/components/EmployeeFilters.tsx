import { HiMagnifyingGlass } from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import type { EmployeeStatus } from '../../../types';

const STATUS_OPTIONS: Array<{ value: EmployeeStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'terminated', label: 'Terminated' },
];

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  status: EmployeeStatus | '';
  onStatusChange: (value: EmployeeStatus | '') => void;
  departments: string[];
}

export const EmployeeFilters = ({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  departments,
}: EmployeeFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
      <FormField label="Search" htmlFor="employee-search" className="flex-1">
        <Input
          id="employee-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, email, job title…"
          icon={<HiMagnifyingGlass className="h-5 w-5 text-brand-600" />}
        />
      </FormField>
      <FormField label="Department" htmlFor="employee-department">
        <select
          id="employee-department"
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="block w-full min-w-[10rem] rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Status" htmlFor="employee-status">
        <select
          id="employee-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as EmployeeStatus | '')}
          className="block w-full min-w-[10rem] rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    </div>
  );
}
