import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  fetchEmployee,
  fetchEmployeeDepartments,
  fetchEmployees,
  updateEmployee,
} from '../../lib/api';
import { hasFormChanges, pickChangedFields } from '../../utils/form';
import { hasPermission } from '../../utils/permissions';
import {
  EmployeeEditFields,
  toEmployeeFormValues,
  type EmployeeFormValues,
} from './components/EmployeeEditForm';
import { EmployeeStatusBadge } from './components/EmployeeStatusBadge';
import { employeeName } from './utils';

const FORM_ID = 'employee-edit-page-form';

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

export const EmployeeEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<EmployeeFormValues | null>(null);

  const canUpdate = user && hasPermission(user.role, 'employee:update');

  const employeeQuery = useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployee(id!),
    enabled: Boolean(canUpdate && id),
  });

  const managersQuery = useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(canUpdate && id),
  });

  const departmentsQuery = useQuery({
    queryKey: ['employees', 'departments'],
    queryFn: fetchEmployeeDepartments,
    enabled: Boolean(canUpdate && id),
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
      updateEmployee(id!, input),
    onSuccess: (updated, variables) => {
      const isDeactivateOnly =
        variables.status === 'terminated' && Object.keys(variables).length === 1;
      toast.success(isDeactivateOnly ? 'Employee deactivated.' : 'Employee updated successfully.');
      setForm(toEmployeeFormValues(updated));
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
      void queryClient.invalidateQueries({ queryKey: ['employees', id] });
      navigate(`/dashboard/employees/${id}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update employee');
    },
  });

  if (!canUpdate) {
    return <Navigate to="/dashboard/employees" replace />;
  }

  if (!id) {
    return <Navigate to="/dashboard/employees" replace />;
  }

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

  const handleCancel = () => {
    if (!updateMutation.isPending) {
      navigate(`/dashboard/employees/${id}`);
    }
  };

  const managerOptions = (managersQuery.data ?? []).filter(
    (candidate) => candidate.id !== employee?.id && candidate.status !== 'terminated'
  );

  const loading = updateMutation.isPending;
  const showForm = Boolean(employee && form);

  return (
    <PageContainer className="space-y-6">
      <div>
        <Link
          to={`/dashboard/employees/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to employee
        </Link>
      </div>

      {employeeQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {employeeQuery.isError && (
        <p className="text-sm text-red-600">Failed to load employee details.</p>
      )}

      {employee && (
        <PageHeader
          label="People"
          title={
            <span className="flex flex-wrap items-center gap-2">
              Edit {employeeName(employee)}
              <EmployeeStatusBadge status={employee.status} />
            </span>
          }
          description={`${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`}
        />
      )}

      {showForm && (
        <form
          id={FORM_ID}
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <EmployeeEditFields
            form={form!}
            onFieldChange={updateField}
            managerOptions={managerOptions}
            departmentOptions={departmentsQuery.data ?? []}
            idPrefix="edit-"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
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
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                loadingText="Saving…"
                disabled={!hasChanges || loading}
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </PageContainer>
  );
};
