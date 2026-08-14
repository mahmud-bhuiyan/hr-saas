import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import { PageContainer } from '../../components/ui/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useMyAttendanceStatus } from '../../hooks/useMyAttendanceStatus';
import {
  ApiError,
  fetchMyEmployee,
  fetchProfile,
  readFileAsBase64,
  updateProfile,
  uploadProfileAvatar,
} from '../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../utils/form';
import { hasPermission } from '../../utils/permissions';
import { isQueryInitialLoad } from '../../utils/query';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProfileHeaderBanner } from './components/ProfileHeaderBanner';
import { ProfileSecuritySection } from './components/ProfileSecuritySection';
import type { AuthUser } from '../../types';

const toAuthUser = (profile: {
  id: string;
  email: string;
  role: AuthUser['role'];
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  colorScheme?: AuthUser['colorScheme'];
  themeColor?: AuthUser['themeColor'];
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchProfile,
  });

  const employeeQuery = useQuery({
    queryKey: ['employees', 'me'],
    queryFn: fetchMyEmployee,
    retry: false,
  });

  const statusQuery = useMyAttendanceStatus();
  const canClock = Boolean(user && hasPermission(user.role, 'attendance:clock:own'));
  const clockedIn =
    canClock && !statusQuery.isError && statusQuery.data
      ? statusQuery.data.clockedIn
      : undefined;

  const profile = profileQuery.data;

  const originalValues = useMemo(
    () => ({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
    }),
    [profile]
  );

  const currentValues = useMemo(
    () => ({ firstName, lastName, email }),
    [firstName, lastName, email]
  );

  const profileFields = ['firstName', 'lastName', 'email'] as const;
  const hasChanges = hasFormChanges(currentValues, originalValues, [...profileFields]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setEmail(profile.email);
    }
  }, [profile]);

  const applyProfileUpdate = (data: { user: Parameters<typeof toAuthUser>[0]; accessToken?: string }) => {
    const nextUser = toAuthUser(data.user);
    setUser(nextUser);
    if (data.accessToken && accessToken) {
      setAuth(nextUser, data.accessToken);
    }
    void queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
  };

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully.');
      applyProfileUpdate(data);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update profile');
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (data) => {
      toast.success('Profile photo updated.');
      applyProfileUpdate(data);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload profile photo');
    },
  });

  const avatarRemoveMutation = useMutation({
    mutationFn: () => updateProfile({ avatarUrl: null }),
    onSuccess: (data) => {
      toast.success('Profile photo removed.');
      applyProfileUpdate(data);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove profile photo');
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    updateMutation.mutate(
      pickChangedFields(currentValues, originalValues, [...profileFields])
    );
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
        employee={employeeQuery.data}
        clockedIn={clockedIn}
      />

      <ProfileEditForm
        user={user}
        firstName={firstName}
        lastName={lastName}
        email={email}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onEmailChange={setEmail}
        onAvatarUpload={handleAvatarUpload}
        onAvatarRemove={handleAvatarRemove}
        avatarUploading={avatarUploadMutation.isPending}
        avatarRemoving={avatarRemoveMutation.isPending}
        onSubmit={handleSubmit}
        loading={updateMutation.isPending}
        hasChanges={hasChanges}
      />

      <ProfileSecuritySection
        onChangePassword={() => setPasswordModalOpen(true)}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => toast.success('Password updated successfully.')}
      />
    </PageContainer>
  );
};
