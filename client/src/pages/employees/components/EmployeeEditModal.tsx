import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import {
  ApiError,
  fetchEmployee,
  fetchEmployees,
  updateEmployee,
} from '../../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../../utils/form';
import { employeeName } from '../utils';
import {
  EmployeeEditFields,
  toEmployeeFormValues,
  type EmployeeFormValues,
} from './EmployeeEditForm';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

const FORM_ID = 'employee-edit-modal-form';

const editableKeys = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'jobTitle',
  'department',
  'startDate',
  'managerId',
  'status',
] as const;

interface EmployeeEditModalProps {
  employeeId: string | null;
  onClose: () => void;
}

export const EmployeeEditModal = ({ employeeId, onClose }: EmployeeEditModalProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmployeeFormValues | null>(null);

  const employeeQuery = useQuery({
    queryKey: ['employees', employeeId],
    queryFn: () => fetchEmployee(employeeId!),
    enabled: Boolean(employeeId),
  });

  const managersQuery = useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(employeeId),
  });

  const employee = employeeQuery.data;
  const originalValues = useMemo(
    () => (employee ? toEmployeeFormValues(employee) : null),
    [employee]
  );

  useEffect(() => {
    if (employee) {
      setForm(toEmployeeFormValues(employee));
    } else {
      setForm(null);
    }
  }, [employee]);

  const hasChanges =
    form && originalValues
      ? hasFormChanges(
          form as unknown as Record<string, unknown>,
          originalValues as unknown as Record<string, unknown>,
          [...editableKeys]
        )
      : false;

  const updateMutation = useMutation({
    mutationFn: (input: ReturnType<typeof pickChangedFields<Record<string, unknown>>>) =>
      updateEmployee(employeeId!, input),
    onSuccess: (updated, variables) => {
      const isDeactivateOnly =
        variables.status === 'terminated' && Object.keys(variables).length === 1;
      toast.success(isDeactivateOnly ? 'Employee deactivated.' : 'Employee updated successfully.');
      setForm(toEmployeeFormValues(updated));
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
      void queryClient.invalidateQueries({ queryKey: ['employees', employeeId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update employee');
    },
  });

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };

  const updateField = <K extends keyof EmployeeFormValues,>(
    key: K,
    value: EmployeeFormValues[K]
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!form || !originalValues || !hasChanges) {
      return;
    }

    const changes = pickChangedFields(
      form as unknown as Record<string, unknown>,
      originalValues as unknown as Record<string, unknown>,
      [...editableKeys]
    );

    if (changes.managerId === '') {
      changes.managerId = null;
    }

    updateMutation.mutate(changes);
  };

  const handleDeactivate = () => {
    if (!employee) {
      return;
    }
    const name = employeeName(employee);
    if (!window.confirm(`Deactivate ${name}? Their status will be set to terminated.`)) {
      return;
    }

    updateMutation.mutate({ status: 'terminated' });
  };

  const managerOptions = (managersQuery.data ?? []).filter(
    (candidate) => candidate.id !== employee?.id && candidate.status !== 'terminated'
  );

  const loading = updateMutation.isPending;
  const showForm = Boolean(employee && form);

  return (
    <Modal
      open={Boolean(employeeId)}
      onClose={handleClose}
      title={
        employee ? (
          <span className="flex flex-wrap items-center gap-2">
            {employeeName(employee)}
            <EmployeeStatusBadge status={employee.status} />
          </span>
        ) : (
          'Edit employee'
        )
      }
      description={
        employee
          ? `${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`
          : undefined
      }
      size="xl"
      footer={
        showForm ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {employee?.status !== 'terminated' && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDeactivate}
                loading={loading}
                loadingText="Deactivating…"
                disabled={loading}
              >
                Deactivate employee
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                form={FORM_ID}
                loading={loading}
                loadingText="Saving…"
                disabled={!hasChanges || loading}
              >
                Save changes
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {employeeQuery.isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {employeeQuery.isError && (
        <p className="text-sm text-red-600">Failed to load employee details.</p>
      )}

      {showForm && (
        <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <EmployeeEditFields
            form={form!}
            onFieldChange={updateField}
            managerOptions={managerOptions}
            idPrefix="edit-"
          />
        </form>
      )}
    </Modal>
  );
};
