import { FormEvent } from 'react';
import {
  HiBriefcase,
  HiCalendarDays,
  HiEnvelope,
  HiPhone,
  HiRectangleGroup,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/forms/FormModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { CreateEmployeeInput, Employee } from '../../../types';
import { employeeName } from '../utils';

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CreateEmployeeInput;
  onFormChange: (updater: (prev: CreateEmployeeInput) => CreateEmployeeInput) => void;
  managerOptions: Employee[];
  departmentOptions: string[];
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
  departmentOptions,
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
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Last name" htmlFor="create-lastName">
          <Input
            id="create-lastName"
            value={form.lastName}
            onChange={(e) => onFormChange((f) => ({ ...f, lastName: e.target.value }))}
            required
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
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
            icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Phone" htmlFor="create-phone">
          <Input
            id="create-phone"
            value={form.phone ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, phone: e.target.value }))}
            icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor="create-jobTitle">
          <Input
            id="create-jobTitle"
            value={form.jobTitle ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, jobTitle: e.target.value }))}
            icon={<HiBriefcase className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Department" htmlFor="create-department">
          <Select
            id="create-department"
            value={form.department ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, department: e.target.value || undefined }))}
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
        <FormField label="Start date" htmlFor="create-startDate">
          <Input
            id="create-startDate"
            type="date"
            value={form.startDate ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, startDate: e.target.value }))}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Manager" htmlFor="create-managerId">
          <Select
            id="create-managerId"
            value={form.managerId ?? ''}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, managerId: e.target.value || undefined }))
            }
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
    </FormModal>
  );
};
