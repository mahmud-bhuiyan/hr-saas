import { HiMagnifyingGlass, HiQueueList, HiRectangleGroup } from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PAGE_SIZE_OPTIONS } from '../../../hooks/usePagination';

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  departments: string[];
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

export const EmployeeFilters = ({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  departments,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: EmployeeFiltersProps) => {
  return (
    <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <FormField label="Rows per page" htmlFor="employee-page-size">
        <Select
          id="employee-page-size"
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="min-w-[5rem]"
          icon={<HiQueueList className="h-4 w-4 text-brand-600" />}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Search" htmlFor="employee-search" className="flex-1">
        <Input
          id="employee-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, email, job title…"
          icon={<HiMagnifyingGlass className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField label="Department" htmlFor="employee-department">
        <Select
          id="employee-department"
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="min-w-[10rem]"
          icon={<HiRectangleGroup className="h-4 w-4 text-brand-600" />}
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
};
