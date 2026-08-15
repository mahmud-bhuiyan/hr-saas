import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import {
  ApiError,
  approveRegistration,
  createCompany,
  fetchApprovedCompanies,
  fetchCompanyModules,
  fetchPendingRegistrations,
  rejectRegistration,
  updateCompany,
  updateCompanyModules,
} from "../../lib/api";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import {
  ALL_TENANT_MODULE_IDS,
  resolveEnabledModules,
  type TenantModuleId,
} from "../../types/modules";
import type {
  CreateCompanyInput,
  RegistrationRequest,
  UpdateCompanyInput,
} from "../../types";
import {
  areRequiredFieldsFilled,
  hasFormChanges,
  pickChangedFields,
} from "../../utils/form";
import { isQueryInitialLoad } from "../../utils/query";
import { CompaniesTabs } from "./components/CompaniesTabs";
import {
  ApproveRegistrationModal,
  CompanyDetailsModal,
  CreateCompanyModal,
  EditCompanyModal,
  RejectRegistrationModal,
} from "./components/RegistrationsModals";
import { ManageCompanyModulesModal } from "./components/ManageCompanyModulesModal";
import { PendingRegistrationsTable } from "./components/PendingRegistrationsTable";
import { RegisteredCompaniesTable } from "./components/RegisteredCompaniesTable";
import {
  type CompaniesListVariant,
  type EditCompanyForm,
  editFormKeys,
  emptyCreateForm,
  PENDING_COMPANIES_PATH,
  REGISTERED_COMPANIES_PATH,
  toEditForm,
} from "./utils";

const companiesListVariant = (pathname: string): CompaniesListVariant => {
  return pathname.startsWith(PENDING_COMPANIES_PATH) ? "pending" : "registered";
};

export const RegistrationsPage = () => {
  const { pathname } = useLocation();
  const variant = companiesListVariant(pathname);
  const isRegisteredList = variant === "registered";

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateCompanyInput>(emptyCreateForm);
  const [approveTarget, setApproveTarget] =
    useState<RegistrationRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RegistrationRequest | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [editTarget, setEditTarget] = useState<RegistrationRequest | null>(
    null,
  );
  const [editForm, setEditForm] = useState<EditCompanyForm | null>(null);
  const [editOriginal, setEditOriginal] = useState<EditCompanyForm | null>(
    null,
  );
  const [detailsTarget, setDetailsTarget] =
    useState<RegistrationRequest | null>(null);
  const [modulesTarget, setModulesTarget] =
    useState<RegistrationRequest | null>(null);
  const [modulesSelection, setModulesSelection] = useState<TenantModuleId[]>(
    [],
  );
  const [modulesOriginal, setModulesOriginal] = useState<TenantModuleId[]>([]);

  const pendingQuery = useQuery({
    queryKey: ["registrations", "pending"],
    queryFn: fetchPendingRegistrations,
    enabled: user?.role === "super_admin",
  });

  const approvedQuery = useQuery({
    queryKey: ["registrations", "approved"],
    queryFn: fetchApprovedCompanies,
    enabled: user?.role === "super_admin",
  });

  const invalidateRegistrations = () => {
    void queryClient.invalidateQueries({ queryKey: ["registrations"] });
  };

  const approveMutation = useMutation({
    mutationFn: approveRegistration,
    onSuccess: (company) => {
      setApproveTarget(null);
      toast.success(
        `${company.companyName} was approved. The company admin can sign in.`,
      );
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Approval failed");
      setApproveTarget(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (company) => {
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success(
        `${company.companyName} was created. The company admin can sign in immediately.`,
      );
      navigate(REGISTERED_COMPANIES_PATH);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to create company",
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) =>
      rejectRegistration(tenantId, reason),
    onSuccess: () => {
      setRejectTarget(null);
      setRejectReason("");
      toast.success("Registration rejected.");
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Rejection failed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      tenantId,
      input,
    }: {
      tenantId: string;
      input: UpdateCompanyInput;
    }) => updateCompany(tenantId, input),
    onSuccess: (company) => {
      setEditTarget(null);
      setEditForm(null);
      setEditOriginal(null);
      toast.success(`${company.companyName} was updated.`);
      invalidateRegistrations();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    },
  });

  const updateModulesMutation = useMutation({
    mutationFn: ({
      tenantId,
      enabledModules,
    }: {
      tenantId: string;
      enabledModules: TenantModuleId[];
    }) => updateCompanyModules(tenantId, { enabledModules }),
    onSuccess: () => {
      setModulesTarget(null);
      setModulesSelection([]);
      setModulesOriginal([]);
      invalidateRegistrations();
      toast.success("Company modules updated.");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update modules",
      );
    },
  });

  const createRequiredKeys = ["companyName", "email", "password"] as const;
  const canSubmitCreate = areRequiredFieldsFilled(
    createForm as unknown as Record<string, unknown>,
    [...createRequiredKeys],
  );

  const canSubmitEdit =
    editForm &&
    editOriginal &&
    editForm.companyName.trim().length >= 2 &&
    editForm.adminEmail.trim().length > 0 &&
    hasFormChanges(
      editForm as unknown as Record<string, unknown>,
      editOriginal as unknown as Record<string, unknown>,
      editFormKeys,
    );

  if (user?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const pending = pendingQuery.data ?? [];
  const registered = approvedQuery.data ?? [];

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
      companyName: createForm.companyName.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      firstName: createForm.firstName?.trim() || undefined,
      lastName: createForm.lastName?.trim() || undefined,
    });
  };

  const openRejectModal = (item: RegistrationRequest) => {
    setRejectTarget(item);
    setRejectReason("");
  };

  const closeRejectModal = () => {
    if (!rejectMutation.isPending) {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const handleRejectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectTarget) {
      return;
    }
    rejectMutation.mutate({
      tenantId: rejectTarget.tenantId,
      reason: rejectReason || undefined,
    });
  };

  const openEditModal = (item: RegistrationRequest) => {
    const form = toEditForm(item);
    setEditTarget(item);
    setEditForm(form);
    setEditOriginal(form);
  };

  const closeEditModal = () => {
    if (!updateMutation.isPending) {
      setEditTarget(null);
      setEditForm(null);
      setEditOriginal(null);
    }
  };

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
      isActive: editForm.isActive,
    };

    const changes = pickChangedFields(
      trimmed as unknown as Record<string, unknown>,
      editOriginal as unknown as Record<string, unknown>,
      editFormKeys,
    ) as UpdateCompanyInput;

    updateMutation.mutate({ tenantId: editTarget.tenantId, input: changes });
  };

  const openModulesModal = async (item: RegistrationRequest) => {
    setModulesTarget(item);
    try {
      const modules = await fetchCompanyModules(item.tenantId);
      setModulesSelection([...modules.enabledModules]);
      setModulesOriginal([...modules.enabledModules]);
    } catch (error) {
      const fallback = resolveEnabledModules(item.enabledModules);
      setModulesSelection([...fallback]);
      setModulesOriginal([...fallback]);
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    }
  };

  const closeModulesModal = () => {
    if (!updateModulesMutation.isPending) {
      setModulesTarget(null);
      setModulesSelection([]);
      setModulesOriginal([]);
    }
  };

  const toggleModuleSelection = (moduleId: TenantModuleId) => {
    setModulesSelection((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
    );
  };

  const handleModulesSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modulesTarget) {
      return;
    }

    updateModulesMutation.mutate({
      tenantId: modulesTarget.tenantId,
      enabledModules: modulesSelection,
    });
  };

  const modulesChanged =
    JSON.stringify([...modulesSelection].sort()) !==
    JSON.stringify([...modulesOriginal].sort());

  const companyActionPending =
    updateMutation.isPending || updateModulesMutation.isPending;

  return (
    <PageContainer flushTop>
      <CompaniesTabs />
      <PageHeader
        label="Super admin"
        title={isRegisteredList ? "Registered companies" : "Pending sign-ups"}
        description={
          isRegisteredList
            ? "Browse and manage companies that are approved and can sign in."
            : "Review self-registration requests before companies can sign in."
        }
        actionAlign="end"
        action={
          isRegisteredList ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={openCreateModal}
            >
              Add company
            </Button>
          ) : undefined
        }
      />

      {isRegisteredList ? (
        <RegisteredCompaniesTable
          registered={registered}
          loading={isQueryInitialLoad(approvedQuery)}
          isError={approvedQuery.isError}
          onViewDetails={setDetailsTarget}
          onEdit={openEditModal}
          onManageModules={(row) => {
            void openModulesModal(row);
          }}
          companyActionPending={companyActionPending}
        />
      ) : (
        <PendingRegistrationsTable
          pending={pending}
          loading={isQueryInitialLoad(pendingQuery)}
          isError={pendingQuery.isError}
          onViewDetails={setDetailsTarget}
          onApprove={(row) => setApproveTarget(row)}
          onReject={openRejectModal}
          approvePending={approveMutation.isPending}
          rejectPending={rejectMutation.isPending}
        />
      )}

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

      <CompanyDetailsModal
        target={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />

      <EditCompanyModal
        target={editTarget}
        form={editForm}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        onFormChange={(updater) => setEditForm((f) => (f ? updater(f) : f))}
        loading={updateMutation.isPending}
        submitDisabled={!canSubmitEdit}
      />

      <ManageCompanyModulesModal
        open={!!modulesTarget}
        onClose={closeModulesModal}
        onSubmit={handleModulesSubmit}
        companyName={modulesTarget?.companyName ?? ""}
        selectedModules={modulesSelection}
        onToggleModule={toggleModuleSelection}
        onSelectAll={() => setModulesSelection([...ALL_TENANT_MODULE_IDS])}
        onClearAll={() => setModulesSelection([])}
        loading={updateModulesMutation.isPending}
        submitDisabled={!modulesChanged}
      />
    </PageContainer>
  );
};

export const RegistrationsIndexRedirect = () => {
  return <Navigate to="registered" replace />;
};
