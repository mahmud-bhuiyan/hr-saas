import { FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormActions } from '../../../components/ui/FormActions';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
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

interface EmployeeEditFormProps {
  form: EmployeeFormValues;
  onFieldChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K]
  ) => void;
  onSubmit: (event: FormEvent) => void;
  managerOptions: Employee[];
  hasChanges: boolean;
  loading: boolean;
  showDeactivate: boolean;
  onDeactivate: () => void;
}

export const EmployeeEditForm = ({
  form,
  onFieldChange,
  onSubmit,
  managerOptions,
  hasChanges,
  loading,
  showDeactivate,
  onDeactivate,
}: EmployeeEditFormProps) => {
  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Edit details</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => onFieldChange('firstName', e.target.value)}
            required
          />
        </FormField>
        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => onFieldChange('lastName', e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor="jobTitle">
          <Input
            id="jobTitle"
            value={form.jobTitle}
            onChange={(e) => onFieldChange('jobTitle', e.target.value)}
          />
        </FormField>
        <FormField label="Department" htmlFor="department">
          <Input
            id="department"
            value={form.department}
            onChange={(e) => onFieldChange('department', e.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => onFieldChange('startDate', e.target.value)}
          />
        </FormField>
        <FormField label="Manager" htmlFor="managerId">
          <select
            id="managerId"
            value={form.managerId}
            onChange={(e) => onFieldChange('managerId', e.target.value)}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">No manager</option>
            {managerOptions.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {employeeName(manager)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Status" htmlFor="status">
        <select
          id="status"
          value={form.status}
          onChange={(e) => onFieldChange('status', e.target.value as EmployeeStatus)}
          className="block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FormActions
          submitLabel="Save changes"
          loading={loading}
          loadingText="Saving…"
          submitDisabled={!hasChanges}
        />
        {showDeactivate && (
          <Button
            type="button"
            variant="danger"
            onClick={onDeactivate}
            loading={loading}
            loadingText="Deactivating…"
            disabled={loading}
          >
            Deactivate employee
          </Button>
        )}
      </div>
    </form>
  );
}

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
}
