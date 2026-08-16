import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ADMIN_DASHBOARD_PATH } from "../../utils";
import { HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { ConfirmModal } from "../../../../components/ui/forms/ConfirmModal";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  createDepartment,
  deleteDepartment,
  fetchManagedDepartments,
  updateDepartment,
} from "../../../../lib/api";
import type { Department } from "../../../../types";
import { areRequiredFieldsFilled } from "../../../../utils/form";
import { isQueryInitialLoad } from "../../../../utils/query";
import { DepartmentFormModal } from "./components/DepartmentFormModal";
import { DepartmentsTable } from "./components/DepartmentsTable";
import { DepartmentsTabs } from "./components/DepartmentsTabs";
import { DEPARTMENTS_ACTIVE_PATH, departmentsListVariant } from "./utils";

export const DepartmentsPage = () => {
  const { pathname } = useLocation();
  const variant = departmentsListVariant(pathname);
  const isActiveList = variant === "active";

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const canAccess = user && ["company_admin", "hr_manager"].includes(user.role);

  const departmentsQuery = useQuery({
    queryKey: ["settings", "departments", "all"],
    queryFn: () => fetchManagedDepartments(true),
    enabled: Boolean(canAccess),
  });

  const invalidateDepartments = () => {
    void queryClient.invalidateQueries({
      queryKey: ["settings", "departments"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["employees", "departments"],
    });
  };

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department created.");
      setCreateOpen(false);
      setCreateName("");
      invalidateDepartments();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to create department",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { name?: string; isArchived?: boolean };
    }) => updateDepartment(id, input),
    onSuccess: (_, variables) => {
      if (variables.input.isArchived === true) {
        toast.success("Department archived.");
      } else if (variables.input.isArchived === false) {
        toast.success("Department restored.");
      } else {
        toast.success("Department updated.");
        setEditTarget(null);
        setEditName("");
      }
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
      invalidateDepartments();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update department",
      );
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success("Department permanently deleted.");
      setDeleteTarget(null);
      setDeleteLoadingId(null);
      invalidateDepartments();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to delete department permanently",
      );
      setDeleteLoadingId(null);
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
    updateMutation.mutate({
      id: editTarget.id,
      input: { name: editName.trim() },
    });
  };

  const handleArchive = (department: Department) => {
    setArchiveLoadingId(department.id);
    updateMutation.mutate({ id: department.id, input: { isArchived: true } });
  };

  const handleRestore = (department: Department) => {
    setRestoreLoadingId(department.id);
    updateMutation.mutate({ id: department.id, input: { isArchived: false } });
  };

  const handleDelete = (department: Department) => {
    setDeleteTarget(department);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteLoadingId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id);
  };

  if (!canAccess) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />;
  }

  if (!variant) {
    return <Navigate to={DEPARTMENTS_ACTIVE_PATH} replace />;
  }

  const allDepartments = departmentsQuery.data ?? [];
  const departments = allDepartments.filter((dept) =>
    isActiveList ? !dept.isArchived : dept.isArchived,
  );

  const tableActionPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    archiveLoadingId !== null ||
    restoreLoadingId !== null ||
    deleteLoadingId !== null;

  return (
    <PageContainer flushTop>
      <DepartmentsTabs />
      <SettingsPageHeader
        title={isActiveList ? "Active departments" : "Archived departments"}
        description="Manage departments for employee assignment and filtering."
        action={
          isActiveList ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setCreateOpen(true)}
            >
              Add department
            </Button>
          ) : undefined
        }
      />

      <DepartmentsTable
        departments={departments}
        variant={variant}
        loading={isQueryInitialLoad(departmentsQuery)}
        onEdit={(dept) => {
          setEditTarget(dept);
          setEditName(dept.name);
        }}
        onArchive={handleArchive}
        onRestore={handleRestore}
        archiveLoadingId={archiveLoadingId}
        restoreLoadingId={restoreLoadingId}
        actionPending={tableActionPending}
        {...(isActiveList
          ? {}
          : {
              onDelete: handleDelete,
              deleteLoadingId,
            })}
      />

      <DepartmentFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateName("");
        }}
        onSubmit={handleCreateSubmit}
        title="Add department"
        description="Create a department for assigning employees."
        submitLabel="Create department"
        name={createName}
        onNameChange={setCreateName}
        loading={createMutation.isPending}
        submitDisabled={
          !areRequiredFieldsFilled({ name: createName }, ["name"])
        }
      />

      <DepartmentFormModal
        open={Boolean(editTarget)}
        onClose={() => {
          setEditTarget(null);
          setEditName("");
        }}
        onSubmit={handleEditSubmit}
        title="Rename department"
        description="Updating the name will also update employees assigned to this department."
        submitLabel="Save changes"
        name={editName}
        onNameChange={setEditName}
        loading={updateMutation.isPending}
        submitDisabled={
          !editTarget || editName.trim() === editTarget.name || !editName.trim()
        }
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete department permanently"
        description={
          deleteTarget
            ? `Permanently delete ${deleteTarget.name}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete permanently"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        loadingText="Deleting…"
      />
    </PageContainer>
  );
};

export const DepartmentsIndexRedirect = () => {
  return <Navigate to="active" replace />;
};
