import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  fetchLeaveSettings,
  patchLeaveSettings,
} from "../../../../lib/api";
import { hasFormChanges, pickChangedFields } from "../../../../utils/form";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { LeaveApprovalCard } from "./components/LeaveApprovalCard";
import { LeaveApprovalEditModal } from "./components/LeaveApprovalEditModal";
import { LeaveEntitlementCard } from "./components/LeaveEntitlementCard";
import { LeaveEntitlementEditModal } from "./components/LeaveEntitlementEditModal";
import {
  DEFAULT_LEAVE_FORM,
  toLeaveForm,
  type LeaveApprovalFormValues,
  type LeaveEntitlementFormValues,
  type LeaveSettingsFormValues,
} from "./utils";

const ENTITLEMENT_KEYS = [
  "plannedLeaveEntitlement",
  "unplannedLeaveEntitlement",
  "unpaidLeaveEntitlement",
  "maxCarryOverDays",
] as const;
const APPROVAL_KEYS = ["multiStepApprovalEnabled"] as const;

const entitlementSlice = (
  values: LeaveSettingsFormValues | LeaveEntitlementFormValues,
): LeaveEntitlementFormValues => ({
  plannedLeaveEntitlement: values.plannedLeaveEntitlement,
  unplannedLeaveEntitlement: values.unplannedLeaveEntitlement,
  unpaidLeaveEntitlement: values.unpaidLeaveEntitlement,
  maxCarryOverDays: values.maxCarryOverDays,
});

export const LeaveSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canManage = user?.role === "company_admin";

  const settingsQuery = useQuery({
    queryKey: ["leave", "settings"],
    queryFn: fetchLeaveSettings,
    enabled: Boolean(canManage),
  });

  const [original, setOriginal] =
    useState<LeaveSettingsFormValues>(DEFAULT_LEAVE_FORM);
  const [entitlementForm, setEntitlementForm] =
    useState<LeaveEntitlementFormValues>(entitlementSlice(DEFAULT_LEAVE_FORM));
  const [approvalForm, setApprovalForm] = useState<LeaveApprovalFormValues>({
    multiStepApprovalEnabled: DEFAULT_LEAVE_FORM.multiStepApprovalEnabled,
  });
  const [entitlementEditOpen, setEntitlementEditOpen] = useState(false);
  const [approvalEditOpen, setApprovalEditOpen] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      const next = toLeaveForm(settingsQuery.data);
      setOriginal(next);
      setEntitlementForm(entitlementSlice(next));
      setApprovalForm({
        multiStepApprovalEnabled: next.multiStepApprovalEnabled,
      });
    }
  }, [settingsQuery.data]);

  const invalidateSettings = () => {
    void queryClient.invalidateQueries({ queryKey: ["leave", "settings"] });
    void queryClient.invalidateQueries({ queryKey: ["leave", "balance"] });
  };

  const entitlementSaveMutation = useMutation({
    mutationFn: () => {
      const changed = pickChangedFields(
        entitlementForm as unknown as Record<string, unknown>,
        entitlementSlice(original) as unknown as Record<string, unknown>,
        [...ENTITLEMENT_KEYS],
      );

      return patchLeaveSettings({
        ...(changed.plannedLeaveEntitlement !== undefined
          ? {
              plannedLeaveEntitlement: Number(
                entitlementForm.plannedLeaveEntitlement,
              ),
            }
          : {}),
        ...(changed.unplannedLeaveEntitlement !== undefined
          ? {
              unplannedLeaveEntitlement: Number(
                entitlementForm.unplannedLeaveEntitlement,
              ),
            }
          : {}),
        ...(changed.unpaidLeaveEntitlement !== undefined
          ? {
              unpaidLeaveEntitlement: Number(
                entitlementForm.unpaidLeaveEntitlement,
              ),
            }
          : {}),
        ...(changed.maxCarryOverDays !== undefined
          ? { maxCarryOverDays: Number(entitlementForm.maxCarryOverDays) }
          : {}),
      });
    },
    onSuccess: () => {
      toast.success("Leave entitlement saved");
      setOriginal((prev) => ({ ...prev, ...entitlementForm }));
      setEntitlementEditOpen(false);
      invalidateSettings();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to save leave entitlement",
      );
    },
  });

  const approvalSaveMutation = useMutation({
    mutationFn: () =>
      patchLeaveSettings({
        multiStepApprovalEnabled:
          approvalForm.multiStepApprovalEnabled === "true",
      }),
    onSuccess: () => {
      toast.success("Approval workflow saved");
      setOriginal((prev) => ({ ...prev, ...approvalForm }));
      setApprovalEditOpen(false);
      invalidateSettings();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to save approval workflow",
      );
    },
  });

  if (!canManage) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const entitlementChanged = hasFormChanges(
    entitlementForm as unknown as Record<string, unknown>,
    entitlementSlice(original) as unknown as Record<string, unknown>,
    [...ENTITLEMENT_KEYS],
  );

  const approvalChanged = hasFormChanges(
    approvalForm as unknown as Record<string, unknown>,
    {
      multiStepApprovalEnabled: original.multiStepApprovalEnabled,
    } as unknown as Record<string, unknown>,
    [...APPROVAL_KEYS],
  );

  const handleOpenEntitlementEdit = () => {
    setEntitlementForm(entitlementSlice(original));
    setEntitlementEditOpen(true);
  };

  const handleCloseEntitlementEdit = () => {
    setEntitlementEditOpen(false);
    setEntitlementForm(entitlementSlice(original));
  };

  const handleOpenApprovalEdit = () => {
    setApprovalForm({
      multiStepApprovalEnabled: original.multiStepApprovalEnabled,
    });
    setApprovalEditOpen(true);
  };

  const handleCloseApprovalEdit = () => {
    setApprovalEditOpen(false);
    setApprovalForm({
      multiStepApprovalEnabled: original.multiStepApprovalEnabled,
    });
  };

  const handleEntitlementSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!entitlementChanged || entitlementSaveMutation.isPending) return;
    entitlementSaveMutation.mutate();
  };

  const handleApprovalSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!approvalChanged || approvalSaveMutation.isPending) return;
    approvalSaveMutation.mutate();
  };

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
        title="Leave policy"
        description="Configure planned, unplanned, and unpaid leave days, carry-over limits, and approval workflow."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <LeaveEntitlementCard
          values={original}
          onEdit={handleOpenEntitlementEdit}
        />
        <LeaveApprovalCard values={original} onEdit={handleOpenApprovalEdit} />
      </div>

      <LeaveEntitlementEditModal
        open={entitlementEditOpen}
        onClose={handleCloseEntitlementEdit}
        values={entitlementForm}
        onChange={(field, value) =>
          setEntitlementForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={handleEntitlementSubmit}
        loading={entitlementSaveMutation.isPending}
        hasChanges={entitlementChanged}
      />

      <LeaveApprovalEditModal
        open={approvalEditOpen}
        onClose={handleCloseApprovalEdit}
        values={approvalForm}
        onChange={(field, value) =>
          setApprovalForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={handleApprovalSubmit}
        loading={approvalSaveMutation.isPending}
        hasChanges={approvalChanged}
      />
    </PageContainer>
  );
};
