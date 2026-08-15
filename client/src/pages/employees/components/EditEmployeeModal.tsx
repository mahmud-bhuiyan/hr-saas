import { FormEvent } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { FormModal } from '../../../components/ui/forms/FormModal';
import { Spinner } from '../../../components/ui/Spinner';
import type { Employee, WorkLocation } from '../../../types';
import { employeeName } from '../utils';
import {
  EmployeeEditFields,
  EmployeePayFields,
  type EmployeeFormValues,
} from './EmployeeEditForm';

const FORM_ID = 'employee-edit-modal-form';

interface EditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  employee: Employee | null;
  form: EmployeeFormValues | null;
  onFieldChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K]
  ) => void;
  managerOptions: Employee[];
  departmentOptions: string[];
  locationOptions: WorkLocation[];
  showPayFields: boolean;
  loading: boolean;
  loadingEmployee: boolean;
  submitDisabled: boolean;
}

export const EditEmployeeModal = ({
  open,
  onClose,
  onSubmit,
  employee,
  form,
  onFieldChange,
  managerOptions,
  departmentOptions,
  locationOptions,
  showPayFields,
  loading,
  loadingEmployee,
  submitDisabled,
}: EditEmployeeModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={employee ? `Edit ${employeeName(employee)}` : 'Edit employee'}
      description={
        employee
          ? `${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`
          : undefined
      }
      submitLabel="Save changes"
      loading={loading}
      submitDisabled={submitDisabled || !form}
      size="lg"
      formId={FORM_ID}
      headerActions={
        <Button
          type="button"
          variant="secondary"
          display="icon"
          aria-label="Close"
          icon={<HiXMark className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
          onClick={onClose}
          disabled={loading}
        />
      }
    >
      {loadingEmployee && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {!loadingEmployee && form && (
        <>
          <EmployeeEditFields
            form={form}
            onFieldChange={onFieldChange}
            managerOptions={managerOptions}
            departmentOptions={departmentOptions}
            idPrefix="edit-modal-"
          />

          {showPayFields && (
            <EmployeePayFields
              form={form}
              onFieldChange={onFieldChange}
              locationOptions={locationOptions}
              idPrefix="edit-modal-"
            />
          )}
        </>
      )}
    </FormModal>
  );
};
