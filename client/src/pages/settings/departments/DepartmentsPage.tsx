import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/Button';
import { PageContainer } from '../../../components/ui/PageContainer';
import { SettingsPageHeader } from '../components/SettingsPageHeader';
import { TabGroup } from '../../../components/ui/TabGroup';
import { useTabUrlState } from '../../../hooks/useTabUrlState';
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

const DEPARTMENTS_TAB_IDS = ['active', 'archived'] as const satisfies readonly DepartmentsTab[];

export const DepartmentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabUrlState(DEPARTMENTS_TAB_IDS, { defaultTab: 'active' });
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

  const tableProps = {
    loading: departmentsQuery.isLoading,
    onEdit: (dept: Department) => {
      setEditTarget(dept);
      setEditName(dept.name);
    },
    onArchive: handleArchive,
    onRestore: handleRestore,
    archiveLoadingId,
    restoreLoadingId,
  };

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
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

      <TabGroup<DepartmentsTab>
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'active',
            label: 'Active',
            count: activeDepartments.length,
            content: <DepartmentsTable departments={activeDepartments} {...tableProps} />,
          },
          {
            id: 'archived',
            label: 'Archived',
            count: archivedDepartments.length,
            content: <DepartmentsTable departments={archivedDepartments} {...tableProps} />,
          },
        ]}
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
