import {
  HiBriefcase,
  HiCalendarDays,
  HiEnvelope,
  HiPhone,
  HiRectangleGroup,
  HiSignal,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Employee, EmployeeStatus } from '../../../types';
import { employeeName } from '../utils';

const STATUS_OPTIONS: Array<{ value: EmployeeStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'terminated', label: 'Terminated' },
];

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerId: string;
  status: EmployeeStatus;
}

interface EmployeeEditFieldsProps {
  form: EmployeeFormValues;
  onFieldChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K]
  ) => void;
  managerOptions: Employee[];
  departmentOptions: string[];
  idPrefix?: string;
}

export const EmployeeEditFields = ({
  form,
  onFieldChange,
  managerOptions,
  departmentOptions,
  idPrefix = '',
}: EmployeeEditFieldsProps) => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor={`${idPrefix}firstName`}>
          <Input
            id={`${idPrefix}firstName`}
            value={form.firstName}
            onChange={(e) => onFieldChange('firstName', e.target.value)}
            required
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Last name" htmlFor={`${idPrefix}lastName`}>
          <Input
            id={`${idPrefix}lastName`}
            value={form.lastName}
            onChange={(e) => onFieldChange('lastName', e.target.value)}
            required
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor={`${idPrefix}email`}>
          <Input
            id={`${idPrefix}email`}
            type="email"
            value={form.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Phone" htmlFor={`${idPrefix}phone`}>
          <Input
            id={`${idPrefix}phone`}
            value={form.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor={`${idPrefix}jobTitle`}>
          <Input
            id={`${idPrefix}jobTitle`}
            value={form.jobTitle}
            onChange={(e) => onFieldChange('jobTitle', e.target.value)}
            icon={<HiBriefcase className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Department" htmlFor={`${idPrefix}department`}>
          <Select
            id={`${idPrefix}department`}
            value={form.department}
            onChange={(e) => onFieldChange('department', e.target.value)}
            icon={<HiRectangleGroup className="h-4 w-4 text-brand-600" />}
          >
            <option value="">No department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor={`${idPrefix}startDate`}>
          <Input
            id={`${idPrefix}startDate`}
            type="date"
            value={form.startDate}
            onChange={(e) => onFieldChange('startDate', e.target.value)}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Manager" htmlFor={`${idPrefix}managerId`}>
          <Select
            id={`${idPrefix}managerId`}
            value={form.managerId}
            onChange={(e) => onFieldChange('managerId', e.target.value)}
            icon={<HiUserGroup className="h-4 w-4 text-brand-600" />}
          >
            <option value="">No manager</option>
            {managerOptions.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {employeeName(manager)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Status" htmlFor={`${idPrefix}status`}>
        <Select
          id={`${idPrefix}status`}
          value={form.status}
          onChange={(e) => onFieldChange('status', e.target.value as EmployeeStatus)}
          className="max-w-xs"
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
    </>
  );
};

export const toEmployeeFormValues = (employee: Employee): EmployeeFormValues => {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    jobTitle: employee.jobTitle ?? '',
    department: employee.department ?? '',
    startDate: employee.startDate ?? '',
    managerId: employee.managerId ?? '',
    status: employee.status,
  };
};
