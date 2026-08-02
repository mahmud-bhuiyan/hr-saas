import { FormEvent } from 'react';
import {
  HiBriefcase,
  HiCalendarDays,
  HiClock,
  HiMapPin,
  HiUser,
} from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/FormModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Employee, Shift, WorkLocation } from '../../../types';
import { areRequiredFieldsFilled, hasFormChanges } from '../../../utils/form';
import { shiftToFormState, type ShiftFormState } from '../utils';

const SHIFT_FORM_KEYS: Array<keyof ShiftFormState> = [
  'date',
  'startTime',
  'endTime',
  'locationId',
  'employeeId',
  'role',
];

interface ShiftFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  description?: string;
  submitLabel: string;
  form: ShiftFormState;
  original?: Shift | null;
  locations: WorkLocation[];
  employees: Employee[];
  loading: boolean;
  onChange: (next: ShiftFormState) => void;
}

export const ShiftFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  form,
  original,
  locations,
  employees,
  loading,
  onChange,
}: ShiftFormModalProps) => {
  const requiredFilled = areRequiredFieldsFilled(
    form as unknown as Record<string, unknown>,
    ['date', 'startTime', 'endTime', 'locationId']
  );

  const submitDisabled = original
    ? !hasFormChanges(
        form as unknown as Record<string, unknown>,
        shiftToFormState(original) as unknown as Record<string, unknown>,
        SHIFT_FORM_KEYS
      ) || !requiredFilled
    : !requiredFilled;

  const activeLocations = locations.filter((location) => !location.isArchived);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      description={description}
      submitLabel={submitLabel}
      loading={loading}
      submitDisabled={submitDisabled}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="shift-date">
          <Input
            id="shift-date"
            type="date"
            value={form.date}
            onChange={(event) => onChange({ ...form, date: event.target.value })}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
            required
          />
        </FormField>

        <FormField label="Employee" htmlFor="shift-employee">
          <Select
            id="shift-employee"
            value={form.employeeId}
            onChange={(event) => onChange({ ...form, employeeId: event.target.value })}
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          >
            <option value="">Open / unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Start time" htmlFor="shift-start">
          <Input
            id="shift-start"
            type="time"
            value={form.startTime}
            onChange={(event) => onChange({ ...form, startTime: event.target.value })}
            icon={<HiClock className="h-4 w-4 text-brand-600" />}
            required
          />
        </FormField>

        <FormField label="End time" htmlFor="shift-end">
          <Input
            id="shift-end"
            type="time"
            value={form.endTime}
            onChange={(event) => onChange({ ...form, endTime: event.target.value })}
            icon={<HiClock className="h-4 w-4 text-brand-600" />}
            required
          />
        </FormField>

        <FormField label="Location" htmlFor="shift-location">
          <Select
            id="shift-location"
            value={form.locationId}
            onChange={(event) => onChange({ ...form, locationId: event.target.value })}
            icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
            required
          >
            <option value="" disabled>
              Select location
            </option>
            {activeLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Role label" htmlFor="shift-role">
          <Input
            id="shift-role"
            value={form.role}
            onChange={(event) => onChange({ ...form, role: event.target.value })}
            placeholder="Optional e.g. Floor"
            icon={<HiBriefcase className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>
    </FormModal>
  );
};
