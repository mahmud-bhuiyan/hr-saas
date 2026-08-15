import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { ConfirmModal } from "../../../../components/ui/forms/ConfirmModal";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { TabGroup } from "../../../../components/ui/TabGroup";
import { useTabUrlState } from "../../../../hooks/useTabUrlState";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  createWorkLocation,
  deleteWorkLocation,
  fetchWorkLocations,
  updateWorkLocation,
} from "../../../../lib/api";
import type { WorkLocation } from "../../../../types";
import { areRequiredFieldsFilled } from "../../../../utils/form";
import { isQueryInitialLoad } from "../../../../utils/query";
import { hasPermission } from "../../../../utils/permissions";
import { LocationFormModal } from "./components/LocationFormModal";
import { LocationsTable } from "./components/LocationsTable";

type LocationsTab = "active" | "archived";

const LOCATIONS_TAB_IDS = [
  "active",
  "archived",
] as const satisfies readonly LocationsTab[];

export const LocationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabUrlState(LOCATIONS_TAB_IDS, {
    defaultTab: "active",
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    address: "",
    timezone: "",
  });
  const [editTarget, setEditTarget] = useState<WorkLocation | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    timezone: "",
  });
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkLocation | null>(null);

  const canAccess = user && hasPermission(user.role, "location:read");

  const locationsQuery = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchWorkLocations(true),
    enabled: Boolean(canAccess),
  });

  const invalidateLocations = () => {
    void queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const createMutation = useMutation({
    mutationFn: createWorkLocation,
    onSuccess: () => {
      toast.success("Location created.");
      setCreateOpen(false);
      setCreateForm({ name: "", address: "", timezone: "" });
      invalidateLocations();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to create location",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        name?: string;
        address?: string;
        timezone?: string;
        isArchived?: boolean;
      };
    }) => updateWorkLocation(id, input),
    onSuccess: (_, variables) => {
      if (variables.input.isArchived === true) {
        toast.success("Location archived.");
      } else if (variables.input.isArchived === false) {
        toast.success("Location restored.");
      } else {
        toast.success("Location updated.");
        setEditTarget(null);
      }
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
      invalidateLocations();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update location",
      );
      setArchiveLoadingId(null);
      setRestoreLoadingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkLocation,
    onSuccess: () => {
      toast.success("Location permanently deleted.");
      setDeleteTarget(null);
      setDeleteLoadingId(null);
      invalidateLocations();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to delete location permanently",
      );
      setDeleteLoadingId(null);
    },
  });

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: createForm.name.trim(),
      address: createForm.address.trim() || undefined,
      timezone: createForm.timezone.trim() || undefined,
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) {
      return;
    }

    const input: { name?: string; address?: string; timezone?: string } = {};
    if (editForm.name.trim() !== editTarget.name) {
      input.name = editForm.name.trim();
    }
    if (editForm.address.trim() !== (editTarget.address ?? "")) {
      input.address = editForm.address.trim();
    }
    if (editForm.timezone.trim() !== (editTarget.timezone ?? "")) {
      input.timezone = editForm.timezone.trim();
    }

    if (Object.keys(input).length === 0) {
      return;
    }

    updateMutation.mutate({ id: editTarget.id, input });
  };

  const handleArchive = (location: WorkLocation) => {
    setArchiveLoadingId(location.id);
    updateMutation.mutate({ id: location.id, input: { isArchived: true } });
  };

  const handleRestore = (location: WorkLocation) => {
    setRestoreLoadingId(location.id);
    updateMutation.mutate({ id: location.id, input: { isArchived: false } });
  };

  const handleDelete = (location: WorkLocation) => {
    setDeleteTarget(location);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteLoadingId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id);
  };

  if (!canAccess) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const allLocations = locationsQuery.data ?? [];
  const activeLocations = allLocations.filter((loc) => !loc.isArchived);
  const archivedLocations = allLocations.filter((loc) => loc.isArchived);

  const tableActionPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    archiveLoadingId !== null ||
    restoreLoadingId !== null ||
    deleteLoadingId !== null;

  const tableProps = {
    loading: isQueryInitialLoad(locationsQuery),
    onEdit: (location: WorkLocation) => {
      setEditTarget(location);
      setEditForm({
        name: location.name,
        address: location.address ?? "",
        timezone: location.timezone ?? "",
      });
    },
    onArchive: handleArchive,
    onRestore: handleRestore,
    archiveLoadingId,
    restoreLoadingId,
    actionPending: tableActionPending,
  };

  const editChanged =
    editTarget &&
    (editForm.name.trim() !== editTarget.name ||
      editForm.address.trim() !== (editTarget.address ?? "") ||
      editForm.timezone.trim() !== (editTarget.timezone ?? ""));

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
        title="Work locations"
        description="Sites where employees work — used for shift scheduling and rota planning."
        action={
          hasPermission(user!.role, "location:manage") ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setCreateOpen(true)}
            >
              Add location
            </Button>
          ) : undefined
        }
      />

      <TabGroup<LocationsTab>
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: "active",
            label: "Active",
            count: activeLocations.length,
            content: (
              <LocationsTable locations={activeLocations} {...tableProps} />
            ),
          },
          {
            id: "archived",
            label: "Archived",
            count: archivedLocations.length,
            content: (
              <LocationsTable
                locations={archivedLocations}
                {...tableProps}
                onDelete={handleDelete}
                deleteLoadingId={deleteLoadingId}
              />
            ),
          },
        ]}
      />

      <LocationFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateForm({ name: "", address: "", timezone: "" });
        }}
        onSubmit={handleCreateSubmit}
        title="Add work location"
        description="Create a site for assigning shifts on the rota."
        submitLabel="Create location"
        name={createForm.name}
        address={createForm.address}
        timezone={createForm.timezone}
        onNameChange={(value) =>
          setCreateForm((prev) => ({ ...prev, name: value }))
        }
        onAddressChange={(value) =>
          setCreateForm((prev) => ({ ...prev, address: value }))
        }
        onTimezoneChange={(value) =>
          setCreateForm((prev) => ({ ...prev, timezone: value }))
        }
        loading={createMutation.isPending}
        submitDisabled={
          !areRequiredFieldsFilled({ name: createForm.name }, ["name"])
        }
      />

      <LocationFormModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        title="Edit work location"
        description="Update location details used on the rota."
        submitLabel="Save changes"
        name={editForm.name}
        address={editForm.address}
        timezone={editForm.timezone}
        onNameChange={(value) =>
          setEditForm((prev) => ({ ...prev, name: value }))
        }
        onAddressChange={(value) =>
          setEditForm((prev) => ({ ...prev, address: value }))
        }
        onTimezoneChange={(value) =>
          setEditForm((prev) => ({ ...prev, timezone: value }))
        }
        loading={updateMutation.isPending}
        submitDisabled={!editChanged || !editForm.name.trim()}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete location permanently"
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
