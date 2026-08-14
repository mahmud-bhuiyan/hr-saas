import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { HiArrowUpTray, HiPlus } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import type { TableSortState } from '../../../components/ui/Table';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ApiError,
  createEmployee,
  fetchEmployeeDepartments,
  fetchEmployees,
  updateEmployee,
} from '../../../lib/api';
import { toast } from 'react-toastify';
import type { CreateEmployeeInput, Employee, EmployeeSortField } from '../../../types';
import { areRequiredFieldsFilled } from '../../../utils/form';
import { hasPermission } from '../../../utils/permissions';
import { usePagination } from '../../../hooks/usePagination';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EmployeeImportModal } from './EmployeeImportModal';
import { EmployeeFilters } from './EmployeeFilters';
import { EmployeesTable } from './EmployeesTable';
import { EmployeesTabs } from './EmployeesTabs';
import { employeeName, employeeEditPath, employeeViewPath, isActiveEmployee } from '../utils';

const emptyCreateForm: CreateEmployeeInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  startDate: '',
};

export type EmployeesListVariant = 'active' | 'inactive';

interface EmployeesListPageProps {
  variant: EmployeesListVariant;
}

export const EmployeesListPage = ({ variant }: EmployeesListPageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEmployeeInput>(emptyCreateForm);
  const [deactivateLoadingId, setDeactivateLoadingId] = useState<string | null>(null);
  const [activateLoadingId, setActivateLoadingId] = useState<string | null>(null);
  const [sort, setSort] = useState<TableSortState>({ key: 'name', direction: 'asc' });

  const canRead =
    user && (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));
  const canCreate = user && hasPermission(user.role, 'employee:create');
  const canUpdate = user && hasPermission(user.role, 'employee:update');

  const sortBy = sort.key as EmployeeSortField;
  const sortOrder = sort.direction;

  const employeesQuery = useQuery({
    queryKey: ['employees', { search, department, sortBy, sortOrder }],
    queryFn: () =>
      fetchEmployees({
        search: search || undefined,
        department: department || undefined,
        sortBy,
        sortOrder,
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

  const deactivateMutation = useMutation({
    mutationFn: (employeeId: string) => updateEmployee(employeeId, { status: 'terminated' }),
    onMutate: (employeeId) => {
      setDeactivateLoadingId(employeeId);
    },
    onSuccess: () => {
      toast.success('Employee deactivated.');
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to deactivate employee');
    },
    onSettled: () => {
      setDeactivateLoadingId(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (employeeId: string) => updateEmployee(employeeId, { status: 'active' }),
    onMutate: (employeeId) => {
      setActivateLoadingId(employeeId);
    },
    onSuccess: () => {
      toast.success('Employee activated.');
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to activate employee');
    },
    onSettled: () => {
      setActivateLoadingId(null);
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

  const allEmployees = employeesQuery.data ?? [];
  const filteredEmployees = useMemo(
    () =>
      allEmployees.filter((employee) =>
        variant === 'active' ? isActiveEmployee(employee) : !isActiveEmployee(employee)
      ),
    [allEmployees, variant]
  );

  const {
    paginatedItems,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    pageSizeOptions,
  } = usePagination(filteredEmployees, {
    resetKey: `${variant}-${search}-${department}-${sortBy}-${sortOrder}`,
  });

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm);
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (!createMutation.isPending) {
      setCreateOpen(false);
    }
  };

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
  };

  const handleDeactivate = (employee: Employee) => {
    const name = employeeName(employee);
    if (!window.confirm(`Deactivate ${name}? Their status will be set to terminated.`)) {
      return;
    }

    deactivateMutation.mutate(employee.id);
  };

  const handleActivate = (employee: Employee) => {
    const name = employeeName(employee);
    if (!window.confirm(`Activate ${name}? Their status will be set to active.`)) {
      return;
    }

    activateMutation.mutate(employee.id);
  };

  const isActiveList = variant === 'active';

  return (
    <PageContainer>
      <EmployeesTabs />
      <PageHeader
        label="People"
        title={isActiveList ? 'Active employees' : 'Inactive employees'}
        description={
          isActiveList
            ? 'Browse, search, and manage active employee records for your company.'
            : 'Browse and manage employees who are no longer active.'
        }
        actionAlign="end"
        action={
          canCreate && isActiveList ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="secondary"
                icon={<HiArrowUpTray className="h-4 w-4 text-brand-600" />}
                onClick={() => setImportOpen(true)}
              >
                Import CSV
              </Button>
              <Button
                icon={<HiPlus className="h-4 w-4 text-white" />}
                onClick={openCreateModal}
              >
                Add employee
              </Button>
            </div>
          ) : undefined
        }
      />

      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        departments={departmentsQuery.data ?? []}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={pageSizeOptions}
      />

      <EmployeesTable
        employees={paginatedItems}
        loading={employeesQuery.isLoading}
        sort={sort}
        onSortChange={setSort}
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
          rangeStart,
          rangeEnd,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions,
        }}
        canUpdate={Boolean(canUpdate)}
        onView={(employee) => navigate(employeeViewPath(employee.id))}
        onEdit={
          canUpdate
            ? (employee) => navigate(employeeEditPath(employee.id))
            : undefined
        }
        deactivateLoadingId={deactivateLoadingId}
        activateLoadingId={activateLoadingId}
        emptyMessage={
          isActiveList
            ? 'No active employees match your filters.'
            : 'No inactive employees match your filters.'
        }
        showStatus={!isActiveList}
        onDeactivate={canUpdate && isActiveList ? handleDeactivate : undefined}
        onActivate={canUpdate && !isActiveList ? handleActivate : undefined}
      />

      <CreateEmployeeModal
        open={createOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        managerOptions={managerOptions}
        departmentOptions={departmentsQuery.data ?? []}
        loading={createMutation.isPending}
        submitDisabled={!canSubmitCreate}
      />

      <EmployeeImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['employees'] });
        }}
      />
    </PageContainer>
  );
};
