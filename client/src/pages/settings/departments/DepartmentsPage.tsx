import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/Button';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Tabs } from '../../../components/ui/Tabs';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ApiError,
  createDepartment,
  fetchManagedDepartments,
  updateDepartment,
} from '../../../lib/api';
import type { Department } from '../../../types';
import { areRequiredFieldsFilled } from '../../../utils/form';
import { DepartmentFormModal } from './components/DepartmentFormModal';
import { DepartmentsTable } from './components/DepartmentsTable';

type DepartmentsTab = 'active' | 'archived';

export const DepartmentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DepartmentsTab>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);

  const canAccess = user && ['company_admin', 'hr_manager'].includes(user.role);

  const departmentsQuery = useQuery({
    queryKey: ['settings', 'departments', 'all'],
    queryFn: () => fetchManagedDepartments(true),
    enabled: Boolean(canAccess),
  });

  const invalidateDepartments = () => {
    void queryClient.invalidateQueries({ queryKey: ['settings', 'departments'] });
    void queryClient.invalidateQueries({ queryKey: ['employees', 'departments'] });
  };

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success('Department created.');
      setCreateOpen(false);
      setCreateName('');
      invalidateDepartments();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; isArchived?: boolean } }) =>
      updateDepartment(id, input),
    onSuccess: (_, variables) => {
      if (variables.input.isArchived === true) {
        toast.success('Department archived.');
      } else if (variables.input.isArchived === false) {
        toast.success('Department restored.');
      } else {
        toast.success('Department updated.');
        setEditTarget(null);
        setEditName('');
      }
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
      invalidateDepartments();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update department');
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
    },
  });

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: createName.trim() });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || editName.trim() === editTarget.name) {
      return;
    }
    updateMutation.mutate({ id: editTarget.id, input: { name: editName.trim() } });
  };

  const handleArchive = (department: Department) => {
    setArchiveLoadingId(department.id);
    updateMutation.mutate({ id: department.id, input: { isArchived: true } });
  };

  const handleRestore = (department: Department) => {
    setRestoreLoadingId(department.id);
    updateMutation.mutate({ id: department.id, input: { isArchived: false } });
  };

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const allDepartments = departmentsQuery.data ?? [];
  const activeDepartments = allDepartments.filter((dept) => !dept.isArchived);
  const archivedDepartments = allDepartments.filter((dept) => dept.isArchived);
  const displayedDepartments = activeTab === 'active' ? activeDepartments : archivedDepartments;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        back={{ to: '/dashboard/settings', label: 'Back to settings' }}
        label="Settings"
        title="Departments"
        description="Manage departments for employee assignment and filtering."
        action={
          <Button
            icon={<HiPlus className="h-4 w-4 text-white" />}
            onClick={() => setCreateOpen(true)}
          >
            Add department
          </Button>
        }
      />

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as DepartmentsTab)}
        tabs={[
          { id: 'active', label: 'Active', count: activeDepartments.length },
          { id: 'archived', label: 'Archived', count: archivedDepartments.length },
        ]}
      />

      <DepartmentsTable
        departments={displayedDepartments}
        loading={departmentsQuery.isLoading}
        onEdit={(dept) => {
          setEditTarget(dept);
          setEditName(dept.name);
        }}
        onArchive={handleArchive}
        onRestore={handleRestore}
        archiveLoadingId={archiveLoadingId}
        restoreLoadingId={restoreLoadingId}
      />

      <DepartmentFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateName('');
        }}
        onSubmit={handleCreateSubmit}
        title="Add department"
        description="Create a department for assigning employees."
        submitLabel="Create department"
        name={createName}
        onNameChange={setCreateName}
        loading={createMutation.isPending}
        submitDisabled={!areRequiredFieldsFilled({ name: createName }, ['name'])}
      />

      <DepartmentFormModal
        open={Boolean(editTarget)}
        onClose={() => {
          setEditTarget(null);
          setEditName('');
        }}
        onSubmit={handleEditSubmit}
        title="Rename department"
        description="Updating the name will also update employees assigned to this department."
        submitLabel="Save changes"
        name={editName}
        onNameChange={setEditName}
        loading={updateMutation.isPending}
        submitDisabled={!editTarget || editName.trim() === editTarget.name || !editName.trim()}
      />
    </PageContainer>
  );
};
