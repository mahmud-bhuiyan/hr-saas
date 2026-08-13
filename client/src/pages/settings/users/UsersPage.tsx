import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, fetchTenantUsers, updateTenantUser } from '../../../lib/api';
import type { TenantUser, UserRole } from '../../../types';
import { hasFormChanges } from '../../../utils/form';
import { EditUserModal } from './components/EditUserModal';
import { UsersTable } from './components/UsersTable';

type EditUserForm = {
  role: Exclude<UserRole, 'super_admin'>;
  isActive: boolean;
};

export const UsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editTarget, setEditTarget] = useState<TenantUser | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm | null>(null);
  const [editOriginal, setEditOriginal] = useState<EditUserForm | null>(null);

  const usersQuery = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: fetchTenantUsers,
    enabled: user?.role === 'company_admin',
  });

  useEffect(() => {
    if (editTarget) {
      const form: EditUserForm = {
        role: editTarget.role as Exclude<UserRole, 'super_admin'>,
        isActive: editTarget.isActive,
      };
      setEditForm(form);
      setEditOriginal(form);
    } else {
      setEditForm(null);
      setEditOriginal(null);
    }
  }, [editTarget]);

  const hasChanges = useMemo(() => {
    if (!editForm || !editOriginal) {
      return false;
    }
    return hasFormChanges(
      editForm as unknown as Record<string, unknown>,
      editOriginal as unknown as Record<string, unknown>,
      ['role', 'isActive']
    );
  }, [editForm, editOriginal]);

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EditUserForm }) => updateTenantUser(id, input),
    onSuccess: () => {
      toast.success('User updated.');
      setEditTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update user');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm || !hasChanges) {
      return;
    }
    updateMutation.mutate({ id: editTarget.id, input: editForm });
  };

  if (user?.role !== 'company_admin') {
    return <Navigate to="/dashboard/settings" replace />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        back={{ to: '/dashboard/settings', label: 'Back to settings' }}
        label="Settings"
        title="Users & roles"
        description="View users in your company and assign their roles."
      />

      <UsersTable
        users={usersQuery.data ?? []}
        loading={usersQuery.isLoading}
        currentUserId={user.id}
        onEdit={setEditTarget}
      />

      <EditUserModal
        open={Boolean(editTarget && editForm)}
        onClose={() => setEditTarget(null)}
        onSubmit={handleSubmit}
        user={editTarget}
        role={editForm?.role ?? 'employee'}
        isActive={editForm?.isActive ?? true}
        onRoleChange={(role) => setEditForm((prev) => (prev ? { ...prev, role } : prev))}
        onActiveChange={(isActive) => setEditForm((prev) => (prev ? { ...prev, isActive } : prev))}
        loading={updateMutation.isPending}
        submitDisabled={!hasChanges}
      />
    </PageContainer>
  );
};
