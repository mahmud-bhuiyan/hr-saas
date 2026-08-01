import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi2';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  createEmployee,
  fetchEmployeeDepartments,
  fetchEmployees,
} from '../../lib/api';
import { toast } from 'react-toastify';
import type { CreateEmployeeInput, EmployeeStatus } from '../../types';
import { areRequiredFieldsFilled } from '../../utils/form';
import { hasPermission } from '../../utils/permissions';
import { CreateEmployeeModal } from './components/CreateEmployeeModal';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeesTable } from './components/EmployeesTable';

const emptyCreateForm: CreateEmployeeInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  startDate: '',
};

export const EmployeesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEmployeeInput>(emptyCreateForm);

  const canRead =
    user && (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));
  const canCreate = user && hasPermission(user.role, 'employee:create');

  const employeesQuery = useQuery({
    queryKey: ['employees', { search, department, status }],
    queryFn: () =>
      fetchEmployees({
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
      }),
    enabled: Boolean(canRead),
  });

  const departmentsQuery = useQuery({
    queryKey: ['employees', 'departments'],
    queryFn: fetchEmployeeDepartments,
    enabled: Boolean(canRead),
  });

  const managersQuery = useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(canCreate && createOpen),
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success('Employee created successfully.');
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create employee');
    },
  });

  const createRequiredKeys = ['firstName', 'lastName'] as const;
  const canSubmitCreate = areRequiredFieldsFilled(
    createForm as unknown as Record<string, unknown>,
    [...createRequiredKeys]
  );

  const managerOptions = useMemo(
    () => (managersQuery.data ?? []).filter((e) => e.status === 'active'),
    [managersQuery.data]
  );

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm);
    setCreateOpen(true);
  }

  const closeCreateModal = () => {
    if (!createMutation.isPending) {
      setCreateOpen(false);
    }
  }

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmitCreate) {
      return;
    }

    createMutation.mutate({
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email?.trim() || undefined,
      phone: createForm.phone?.trim() || undefined,
      jobTitle: createForm.jobTitle?.trim() || undefined,
      department: createForm.department?.trim() || undefined,
      startDate: createForm.startDate || undefined,
      managerId: createForm.managerId || undefined,
    });
  }

  return (
    <PageContainer>
      <PageHeader
        label="People"
        title="Employees"
        description="Browse, search, and manage employee records for your company."
        action={
          canCreate ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={openCreateModal}
            >
              Add employee
            </Button>
          ) : undefined
        }
      />

      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        status={status}
        onStatusChange={setStatus}
        departments={departmentsQuery.data ?? []}
      />

      <EmployeesTable
        employees={employeesQuery.data ?? []}
        loading={employeesQuery.isLoading}
      />

      <CreateEmployeeModal
        open={createOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        managerOptions={managerOptions}
        loading={createMutation.isPending}
        submitDisabled={!canSubmitCreate}
      />
    </PageContainer>
  );
}
