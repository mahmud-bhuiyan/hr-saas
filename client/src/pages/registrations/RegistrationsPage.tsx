import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi2';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import {
  ApiError,
  activateCompany,
  approveRegistration,
  createCompany,
  deactivateCompany,
  fetchApprovedCompanies,
  fetchPendingRegistrations,
  rejectRegistration,
  updateCompany,
} from '../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateCompanyInput, RegistrationRequest, UpdateCompanyInput } from '../../types';
import { areRequiredFieldsFilled, hasFormChanges, pickChangedFields } from '../../utils/form';
import {
  ActivateCompanyModal,
  ApproveRegistrationModal,
  CompanyDetailsModal,
  CreateCompanyModal,
  DeactivateCompanyModal,
  EditCompanyModal,
  RejectRegistrationModal,
} from './components/RegistrationsModals';
import {
  PendingRegistrationsTable,
  RegisteredCompaniesTable,
} from './components/RegistrationsTables';
import {
  type CompaniesTab,
  type EditCompanyForm,
  editFormKeys,
  emptyCreateForm,
  toEditForm,
} from './utils';

export const RegistrationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CompaniesTab>('pending');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCompanyInput>(emptyCreateForm);
  const [approveTarget, setApproveTarget] = useState<RegistrationRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editTarget, setEditTarget] = useState<RegistrationRequest | null>(null);
  const [editForm, setEditForm] = useState<EditCompanyForm | null>(null);
  const [editOriginal, setEditOriginal] = useState<EditCompanyForm | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<RegistrationRequest | null>(null);
  const [activateTarget, setActivateTarget] = useState<RegistrationRequest | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<RegistrationRequest | null>(null);

  const pendingQuery = useQuery({
    queryKey: ['registrations', 'pending'],
    queryFn: fetchPendingRegistrations,
    enabled: user?.role === 'super_admin',
  });

  const approvedQuery = useQuery({
    queryKey: ['registrations', 'approved'],
    queryFn: fetchApprovedCompanies,
    enabled: user?.role === 'super_admin',
  });

  const invalidateRegistrations = () => {
    void queryClient.invalidateQueries({ queryKey: ['registrations'] });
  }

  const approveMutation = useMutation({
    mutationFn: approveRegistration,
    onSuccess: (company) => {
      setApproveTarget(null);
      toast.success(`${company.companyName} was approved. The company admin can sign in.`);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Approval failed');
      setApproveTarget(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (company) => {
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success(
        `${company.companyName} was created. The company admin can sign in immediately.`
      );
      setActiveTab('registered');
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create company');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) =>
      rejectRegistration(tenantId, reason),
    onSuccess: () => {
      setRejectTarget(null);
      setRejectReason('');
      toast.success('Registration rejected.');
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Rejection failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ tenantId, input }: { tenantId: string; input: UpdateCompanyInput }) =>
      updateCompany(tenantId, input),
    onSuccess: (company) => {
      setEditTarget(null);
      setEditForm(null);
      setEditOriginal(null);
      toast.success(`${company.companyName} was updated.`);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCompany,
    onSuccess: (company) => {
      setDeactivateTarget(null);
      toast.success(`${company.companyName} was deactivated. Users can no longer sign in.`);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Deactivation failed');
      setDeactivateTarget(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateCompany,
    onSuccess: (company) => {
      setActivateTarget(null);
      toast.success(`${company.companyName} was reactivated.`);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Activation failed');
      setActivateTarget(null);
    },
  });

  const createRequiredKeys = ['companyName', 'email', 'password'] as const;
  const canSubmitCreate = areRequiredFieldsFilled(
    createForm as unknown as Record<string, unknown>,
    [...createRequiredKeys]
  );

  const canSubmitEdit =
    editForm &&
    editOriginal &&
    editForm.companyName.trim().length >= 2 &&
    editForm.adminEmail.trim().length > 0 &&
    hasFormChanges(
      editForm as unknown as Record<string, unknown>,
      editOriginal as unknown as Record<string, unknown>,
      editFormKeys
    );

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const pending = pendingQuery.data ?? [];
  const registered = approvedQuery.data ?? [];

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
      companyName: createForm.companyName.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      firstName: createForm.firstName?.trim() || undefined,
      lastName: createForm.lastName?.trim() || undefined,
    });
  }

  const openRejectModal = (item: RegistrationRequest) => {
    setRejectTarget(item);
    setRejectReason('');
  }

  const closeRejectModal = () => {
    if (!rejectMutation.isPending) {
      setRejectTarget(null);
      setRejectReason('');
    }
  }

  const handleRejectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectTarget) {
      return;
    }
    rejectMutation.mutate({
      tenantId: rejectTarget.tenantId,
      reason: rejectReason || undefined,
    });
  }

  const openEditModal = (item: RegistrationRequest) => {
    const form = toEditForm(item);
    setEditTarget(item);
    setEditForm(form);
    setEditOriginal(form);
  }

  const closeEditModal = () => {
    if (!updateMutation.isPending) {
      setEditTarget(null);
      setEditForm(null);
      setEditOriginal(null);
    }
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || !editForm || !editOriginal || !canSubmitEdit) {
      return;
    }

    const trimmed: EditCompanyForm = {
      companyName: editForm.companyName.trim(),
      adminEmail: editForm.adminEmail.trim(),
      adminFirstName: editForm.adminFirstName.trim(),
      adminLastName: editForm.adminLastName.trim(),
    };

    const changes = pickChangedFields(
      trimmed as unknown as Record<string, unknown>,
      editOriginal as unknown as Record<string, unknown>,
      editFormKeys
    ) as UpdateCompanyInput;

    updateMutation.mutate({ tenantId: editTarget.tenantId, input: changes });
  }

  const companyActionPending =
    updateMutation.isPending ||
    deactivateMutation.isPending ||
    activateMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        label="Super admin"
        title="Companies"
        description="Add a company directly or review self-registration requests before they can sign in."
        actionAlign="end"
        action={
          <Button
            icon={<HiPlus className="h-4 w-4 text-white" />}
            onClick={openCreateModal}
          >
            Add company
          </Button>
        }
      />

      <section className="space-y-4">
        <Tabs
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as CompaniesTab)}
          tabs={[
            { id: 'pending', label: 'Pending registrations', count: pending.length },
            { id: 'registered', label: 'Registered companies', count: registered.length },
          ]}
        />

        {activeTab === 'pending' && (
          <PendingRegistrationsTable
            pending={pending}
            loading={pendingQuery.isLoading}
            isError={pendingQuery.isError}
            onViewDetails={setDetailsTarget}
            onApprove={(row) => setApproveTarget(row)}
            onReject={openRejectModal}
            approvePending={approveMutation.isPending}
            rejectPending={rejectMutation.isPending}
          />
        )}

        {activeTab === 'registered' && (
          <RegisteredCompaniesTable
            registered={registered}
            loading={approvedQuery.isLoading}
            isError={approvedQuery.isError}
            onViewDetails={setDetailsTarget}
            onEdit={openEditModal}
            onDeactivate={setDeactivateTarget}
            onActivate={setActivateTarget}
            companyActionPending={companyActionPending}
          />
        )}
      </section>

      <CreateCompanyModal
        open={createOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        loading={createMutation.isPending}
        submitDisabled={!canSubmitCreate}
      />

      <ApproveRegistrationModal
        target={approveTarget}
        onClose={() => {
          if (!approveMutation.isPending) {
            setApproveTarget(null);
          }
        }}
        onConfirm={() => {
          if (approveTarget) {
            approveMutation.mutate(approveTarget.tenantId);
          }
        }}
        loading={approveMutation.isPending}
      />

      <RejectRegistrationModal
        target={rejectTarget}
        onClose={closeRejectModal}
        onSubmit={handleRejectSubmit}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        loading={rejectMutation.isPending}
      />

      <CompanyDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />

      <EditCompanyModal
        target={editTarget}
        form={editForm}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        onFormChange={(updater) => setEditForm((f) => (f ? updater(f) : f))}
        loading={updateMutation.isPending}
        submitDisabled={!canSubmitEdit}
      />

      <DeactivateCompanyModal
        target={deactivateTarget}
        onClose={() => {
          if (!deactivateMutation.isPending) {
            setDeactivateTarget(null);
          }
        }}
        onConfirm={() => {
          if (deactivateTarget) {
            deactivateMutation.mutate(deactivateTarget.tenantId);
          }
        }}
        loading={deactivateMutation.isPending}
      />

      <ActivateCompanyModal
        target={activateTarget}
        onClose={() => {
          if (!activateMutation.isPending) {
            setActivateTarget(null);
          }
        }}
        onConfirm={() => {
          if (activateTarget) {
            activateMutation.mutate(activateTarget.tenantId);
          }
        }}
        loading={activateMutation.isPending}
      />
    </PageContainer>
  );
}
