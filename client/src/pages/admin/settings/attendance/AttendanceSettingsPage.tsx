import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { HiSignal } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { FormField } from "../../../../components/ui/FormField";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { Select } from "../../../../components/ui/Select";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  fetchAttendanceSettings,
  patchAttendanceSettings,
} from "../../../../lib/api";
import { hasFormChanges } from "../../../../utils/form";

export const AttendanceSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canManage = user?.role === "company_admin";

  const settingsQuery = useQuery({
    queryKey: ["attendance", "settings"],
    queryFn: fetchAttendanceSettings,
    enabled: Boolean(canManage),
  });

  const [gpsEnabled, setGpsEnabled] = useState("false");
  const [original, setOriginal] = useState("false");

  useEffect(() => {
    if (settingsQuery.data) {
      const value = settingsQuery.data.attendanceGpsEnabled ? "true" : "false";
      setGpsEnabled(value);
      setOriginal(value);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      patchAttendanceSettings({ attendanceGpsEnabled: gpsEnabled === "true" }),
    onSuccess: () => {
      toast.success("Attendance settings saved");
      setOriginal(gpsEnabled);
      void queryClient.invalidateQueries({
        queryKey: ["attendance", "settings"],
      });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to save settings",
      );
    },
  });

  if (!canManage) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const changed = hasFormChanges({ gpsEnabled }, { gpsEnabled: original }, [
    "gpsEnabled",
  ]);

  return (
    <PageContainer>
      <SettingsPageHeader
        title="Attendance settings"
        description="Configure attendance options for your company."
      />

      <div className="card-surface p-6">
        <FormField label="GPS on clock-in">
          <Select
            value={gpsEnabled}
            onChange={(event) => setGpsEnabled(event.target.value)}
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </Select>
          <p className="mt-1.5 text-sm text-slate-500">
            When enabled, employees can share location when clocking in. Off by
            default for privacy.
          </p>
        </FormField>

        <div className="mt-6 flex justify-end">
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
