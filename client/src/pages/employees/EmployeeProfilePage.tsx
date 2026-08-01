import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  fetchEmployee,
  fetchEmployeeReports,
  fetchEmployees,
  updateEmployee,
} from '../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../utils/form';
import { hasPermission } from '../../utils/permissions';
import { DirectReportsTable } from './components/DirectReportsTable';
import {
  EmployeeEditForm,
  toEmployeeFormValues,
  type EmployeeFormValues,
} from './components/EmployeeEditForm';
import { EmployeeProfileSummary } from './components/EmployeeProfileSummary';
import { EmployeeReadOnlyDetails } from './components/EmployeeReadOnlyDetails';
import { EmployeeStatusBadge } from './components/EmployeeStatusBadge';
import { employeeName } from './utils';

export const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<EmployeeFormValues | null>(null);

  const canRead =
    user && (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));
  const canUpdate = user && hasPermission(user.role, 'employee:update');

  const employeeQuery = useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployee(id!),
    enabled: Boolean(canRead && id),
  });

  const reportsQuery = useQuery({
    queryKey: ['employees', id, 'reports'],
    queryFn: () => fetchEmployeeReports(id!),
    enabled: Boolean(canRead && id),
  });

  const managersQuery = useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(canUpdate),
  });

  const employee = employeeQuery.data;
  const originalValues = useMemo(
    () => (employee ? toEmployeeFormValues(employee) : null),
    [employee]
  );

  useEffect(() => {
    if (employee) {
      setForm(toEmployeeFormValues(employee));
    }
  }, [employee]);

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
    onSuccess: (updated) => {
      toast.success('Employee updated successfully.');
      setForm(toEmployeeFormValues(updated));
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
      void queryClient.invalidateQueries({ queryKey: ['employees', id] });
      void queryClient.invalidateQueries({ queryKey: ['employees', id, 'reports'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update employee');
    },
  });

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!id) {
    return <Navigate to="/dashboard/employees" replace />;
  }

  if (employeeQuery.isLoading) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading employee…</p>
      </PageContainer>
    );
  }

  if (employeeQuery.isError || !employee || !form || !originalValues) {
    return (
      <PageContainer>
        <Link
          to="/dashboard/employees"
          className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to employees
        </Link>
        <p className="text-sm text-red-600">Employee not found or you do not have access.</p>
      </PageContainer>
    );
  }

  const managerOptions = (managersQuery.data ?? []).filter(
    (candidate) => candidate.id !== employee.id && candidate.status !== 'terminated'
  );

  const updateField = <K extends keyof EmployeeFormValues,>(key: K, value: EmployeeFormValues[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!hasChanges) {
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
  }

  const handleDeactivate = () => {
    if (!employee) {
      return;
    }
    const name = employeeName(employee);
    if (!window.confirm(`Deactivate ${name}? Their status will be set to terminated.`)) {
      return;
    }

    updateMutation.mutate({ status: 'terminated' });
  }

  return (
    <PageContainer>
      <Link
        to="/dashboard/employees"
        className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to employees
      </Link>

      <PageHeader
        label="Employee profile"
        title={employeeName(employee)}
        description={`${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`}
        action={<EmployeeStatusBadge status={employee.status} />}
      />

      <EmployeeProfileSummary employee={employee} />

      {canUpdate ? (
        <EmployeeEditForm
          form={form}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          managerOptions={managerOptions}
          hasChanges={hasChanges}
          loading={updateMutation.isPending}
          showDeactivate={employee.status !== 'terminated'}
          onDeactivate={handleDeactivate}
        />
      ) : (
        <EmployeeReadOnlyDetails employee={employee} />
      )}

      <DirectReportsTable
        reports={reportsQuery.data ?? []}
        loading={reportsQuery.isLoading}
      />
    </PageContainer>
  );
}
