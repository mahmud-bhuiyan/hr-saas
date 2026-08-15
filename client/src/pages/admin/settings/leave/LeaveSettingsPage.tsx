import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { HiCalendarDays, HiSignal } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { FormField } from "../../../../components/ui/FormField";
import { Input } from "../../../../components/ui/Input";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { Select } from "../../../../components/ui/Select";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  fetchLeaveSettings,
  patchLeaveSettings,
} from "../../../../lib/api";
import { hasFormChanges } from "../../../../utils/form";

type LeaveSettingsForm = {
  annualEntitlement: string;
  maxCarryOverDays: string;
  multiStepApprovalEnabled: string;
};

const toForm = (settings: {
  annualEntitlement: number;
  maxCarryOverDays: number;
  multiStepApprovalEnabled: boolean;
}): LeaveSettingsForm => ({
  annualEntitlement: String(settings.annualEntitlement),
  maxCarryOverDays: String(settings.maxCarryOverDays),
  multiStepApprovalEnabled: settings.multiStepApprovalEnabled
    ? "true"
    : "false",
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

  const [form, setForm] = useState<LeaveSettingsForm>({
    annualEntitlement: "25",
    maxCarryOverDays: "5",
    multiStepApprovalEnabled: "false",
  });
  const [original, setOriginal] = useState<LeaveSettingsForm>(form);

  useEffect(() => {
    if (settingsQuery.data) {
      const next = toForm(settingsQuery.data);
      setForm(next);
      setOriginal(next);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      patchLeaveSettings({
        annualEntitlement: Number(form.annualEntitlement),
        maxCarryOverDays: Number(form.maxCarryOverDays),
        multiStepApprovalEnabled: form.multiStepApprovalEnabled === "true",
      }),
    onSuccess: () => {
      toast.success("Leave policy saved");
      setOriginal(form);
      void queryClient.invalidateQueries({ queryKey: ["leave", "settings"] });
      void queryClient.invalidateQueries({ queryKey: ["leave", "balance"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to save leave policy",
      );
    },
  });

  if (!canManage) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const changed = hasFormChanges(form, original, [
    "annualEntitlement",
    "maxCarryOverDays",
    "multiStepApprovalEnabled",
  ]);

  return (
    <PageContainer maxWidth="lg">
      <SettingsPageHeader
        title="Leave policy"
        description="Configure annual entitlement, carry-over limits, and approval workflow."
      />

      <div className="card-surface space-y-5 p-6">
        <FormField
          label="Annual entitlement (days)"
          htmlFor="annual-entitlement"
        >
          <Input
            id="annual-entitlement"
            type="number"
            min={0}
            max={365}
            value={form.annualEntitlement}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                annualEntitlement: event.target.value,
              }))
            }
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
          <p className="mt-1.5 text-sm text-slate-500">
            Pro-rata applies automatically for mid-year starters based on
            employee start date.
          </p>
        </FormField>

        <FormField label="Max carry-over days" htmlFor="max-carry-over">
          <Input
            id="max-carry-over"
            type="number"
            min={0}
            max={365}
            value={form.maxCarryOverDays}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                maxCarryOverDays: event.target.value,
              }))
            }
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Multi-step approval">
          <Select
            value={form.multiStepApprovalEnabled}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                multiStepApprovalEnabled: event.target.value,
              }))
            }
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            <option value="false">Single approver</option>
            <option value="true">Manager then HR</option>
          </Select>
          <p className="mt-1.5 text-sm text-slate-500">
            When enabled, managers approve step 1 and HR gives final approval on
            step 2.
          </p>
        </FormField>

        <div className="flex justify-end pt-2">
          <Button
            loading={saveMutation.isPending}
            loadingText="Saving…"
            disabled={!changed}
            onClick={() => saveMutation.mutate()}
          >
            Save changes
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
