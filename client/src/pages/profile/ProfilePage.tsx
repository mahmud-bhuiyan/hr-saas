import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, fetchProfile, updateProfile } from '../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../utils/form';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProfileSecuritySection } from './components/ProfileSecuritySection';
import { ProfileSummary } from './components/ProfileSummary';

export const ProfilePage = () => {
  const { setUser, setAuth, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchProfile,
  });

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

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully.');
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        colorScheme: data.user.colorScheme,
      });
      if (data.accessToken && accessToken) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            tenantId: data.user.tenantId,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            colorScheme: data.user.colorScheme,
          },
          data.accessToken
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update profile');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    updateMutation.mutate(
      pickChangedFields(currentValues, originalValues, [...profileFields])
    );
  }

  if (profileQuery.isLoading) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading profile…</p>
      </PageContainer>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load profile.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Account"
        title="My profile"
        description="View and update your account details."
      />

      <ProfileSummary profile={profile} />

      <ProfileEditForm
        firstName={firstName}
        lastName={lastName}
        email={email}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onEmailChange={setEmail}
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
}
