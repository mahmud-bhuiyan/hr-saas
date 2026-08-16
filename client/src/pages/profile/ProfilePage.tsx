import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChangePasswordModal } from "../../components/ChangePasswordModal";
import { PageContainer } from "../../components/ui/PageContainer";
import { useAuth } from "../../contexts/AuthContext";
import { useMyAttendanceStatus } from "../../hooks/useMyAttendanceStatus";
import {
  ApiError,
  fetchProfile,
  readFileAsBase64,
  updateMyEmployee,
  updateProfile,
  uploadProfileAvatar,
} from "../../lib/api";
import { useLinkedEmployee } from "../../hooks/useLinkedEmployee";
import { toast } from "react-toastify";
import { hasFormChanges, pickChangedFields } from "../../utils/form";
import { hasPermission } from "../../utils/permissions";
import { isQueryInitialLoad } from "../../utils/query";
import { ProfileDetailsSection } from "./components/ProfileDetailsSection";
import { ProfileEditModal } from "./components/ProfileEditModal";
import { ProfileHeaderBanner } from "./components/ProfileHeaderBanner";
import { ProfileSecuritySection } from "./components/ProfileSecuritySection";
import type { AuthUser } from "../../types";

const toAuthUser = (profile: {
  id: string;
  email: string;
  role: AuthUser["role"];
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  colorScheme?: AuthUser["colorScheme"];
  themeColor?: AuthUser["themeColor"];
}): AuthUser => ({
  id: profile.id,
  email: profile.email,
  role: profile.role,
  tenantId: profile.tenantId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  avatarUrl: profile.avatarUrl,
  colorScheme: profile.colorScheme,
  themeColor: profile.themeColor,
});

export const ProfilePage = () => {
  const { user, setUser, setAuth, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchProfile,
  });

  const employeeQuery = useLinkedEmployee();
  const linkedEmployee = employeeQuery.data;
  const canEditPhone = Boolean(linkedEmployee);

  const statusQuery = useMyAttendanceStatus();
  const canClock = Boolean(
    user && hasPermission(user.role, "attendance:clock:own"),
  );
  const clockedIn =
    canClock && !statusQuery.isError && statusQuery.data
      ? statusQuery.data.clockedIn
      : undefined;

  const profile = profileQuery.data;

  const originalValues = useMemo(
    () => ({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      phone: linkedEmployee?.phone ?? "",
    }),
    [profile, linkedEmployee],
  );

  const currentValues = useMemo(
    () => ({ firstName, lastName, phone }),
    [firstName, lastName, phone],
  );

  const nameFields = ["firstName", "lastName"] as const;
  const editableFields = canEditPhone
    ? (["firstName", "lastName", "phone"] as const)
    : nameFields;

  const hasChanges = hasFormChanges(currentValues, originalValues, [
    ...editableFields,
  ]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
    }
  }, [profile]);

  useEffect(() => {
    setPhone(linkedEmployee?.phone ?? "");
  }, [linkedEmployee]);

  const resetEditForm = () => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
    }
    setPhone(linkedEmployee?.phone ?? "");
  };

  const applyProfileUpdate = (data: {
    user: Parameters<typeof toAuthUser>[0];
    accessToken?: string;
  }) => {
    const nextUser = toAuthUser(data.user);
    setUser(nextUser);
    if (data.accessToken && accessToken) {
      setAuth(nextUser, data.accessToken);
    }
    void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
  };

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const nameChanges = pickChangedFields(currentValues, originalValues, [
        ...nameFields,
      ]);

      if (Object.keys(nameChanges).length > 0) {
        const data = await updateProfile(nameChanges);
        applyProfileUpdate(data);
      }

      if (canEditPhone && phone !== originalValues.phone) {
        await updateMyEmployee({ phone });
        void queryClient.invalidateQueries({ queryKey: ["employees", "me"] });
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      setEditModalOpen(false);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update profile",
      );
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (data) => {
      toast.success("Profile photo updated.");
      applyProfileUpdate(data);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to upload profile photo",
      );
    },
  });

  const avatarRemoveMutation = useMutation({
    mutationFn: () => updateProfile({ avatarUrl: null }),
    onSuccess: (data) => {
      toast.success("Profile photo removed.");
      applyProfileUpdate(data);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to remove profile photo",
      );
    },
  });

  const handleAvatarUpload = async (file: File) => {
    const imageBase64 = await readFileAsBase64(file);
    await avatarUploadMutation.mutateAsync({
      imageBase64,
      filename: file.name,
    });
  };

  const handleAvatarRemove = async () => {
    await avatarRemoveMutation.mutateAsync();
  };

  const handleOpenEdit = () => {
    resetEditForm();
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    resetEditForm();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    if (canEditPhone && !phone.trim()) {
      toast.error("Phone is required.");
      return;
    }

    saveProfileMutation.mutate();
  };

  if (isQueryInitialLoad(profileQuery)) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading profile…</p>
      </PageContainer>
    );
  }

  if (profileQuery.isError || !profile || !user) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load profile.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <ProfileHeaderBanner
        user={user}
        profile={profile}
        employee={linkedEmployee}
        clockedIn={clockedIn}
      />

      <ProfileDetailsSection
        profile={profile}
        employee={linkedEmployee}
        onEdit={handleOpenEdit}
      />

      <ProfileSecuritySection
        onChangePassword={() => setPasswordModalOpen(true)}
      />

      <ProfileEditModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        user={user}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        showPhone={canEditPhone}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onPhoneChange={setPhone}
        onAvatarUpload={handleAvatarUpload}
        onAvatarRemove={handleAvatarRemove}
        avatarUploading={avatarUploadMutation.isPending}
        avatarRemoving={avatarRemoveMutation.isPending}
        onSubmit={handleSubmit}
        loading={saveProfileMutation.isPending}
        hasChanges={hasChanges}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => toast.success("Password updated successfully.")}
      />
    </PageContainer>
  );
};
