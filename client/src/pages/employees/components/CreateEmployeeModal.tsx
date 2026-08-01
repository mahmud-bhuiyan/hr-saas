import { FormEvent } from 'react';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/FormModal';
import { Input } from '../../../components/ui/Input';
import type { CreateEmployeeInput, Employee } from '../../../types';
import { employeeName } from '../utils';

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CreateEmployeeInput;
  onFormChange: (updater: (prev: CreateEmployeeInput) => CreateEmployeeInput) => void;
  managerOptions: Employee[];
  loading: boolean;
  submitDisabled: boolean;
}

export const CreateEmployeeModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  managerOptions,
  loading,
  submitDisabled,
}: CreateEmployeeModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Add employee"
      description="Create a new employee record. Required fields are marked."
      submitLabel="Create employee"
      loading={loading}
      submitDisabled={submitDisabled}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="create-firstName">
          <Input
            id="create-firstName"
            value={form.firstName}
            onChange={(e) => onFormChange((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
        </FormField>
        <FormField label="Last name" htmlFor="create-lastName">
          <Input
            id="create-lastName"
            value={form.lastName}
            onChange={(e) => onFormChange((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="create-email">
          <Input
            id="create-email"
            type="email"
            value={form.email ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField label="Phone" htmlFor="create-phone">
          <Input
            id="create-phone"
            value={form.phone ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, phone: e.target.value }))}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor="create-jobTitle">
          <Input
            id="create-jobTitle"
            value={form.jobTitle ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, jobTitle: e.target.value }))}
          />
        </FormField>
        <FormField label="Department" htmlFor="create-department">
          <Input
            id="create-department"
            value={form.department ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, department: e.target.value }))}
            placeholder="e.g. Engineering"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor="create-startDate">
          <Input
            id="create-startDate"
            type="date"
            value={form.startDate ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, startDate: e.target.value }))}
          />
        </FormField>
        <FormField label="Manager" htmlFor="create-managerId">
          <select
            id="create-managerId"
            value={form.managerId ?? ''}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, managerId: e.target.value || undefined }))
            }
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
    </FormModal>
  );
}
