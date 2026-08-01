import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { Button } from '../components/ui/Button';
import { FormActions } from '../components/ui/FormActions';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, fetchProfile, updateProfile } from '../lib/api';
import type { UserProfile } from '../types';
import { hasFormChanges, pickChangedFields } from '../utils/form';
import { HiEnvelope, HiLockClosed, HiUser } from 'react-icons/hi2';

function roleLabel(role: string): string {
  return role.replace(/_/g, ' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function ProfilePage() {
  const { setUser, setAuth, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('');
      setSuccess('Profile updated successfully.');
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
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
          },
          data.accessToken
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (err) => {
      setSuccess('');
      setError(err instanceof ApiError ? err.message : 'Failed to update profile');
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hasChanges) {
      return;
    }

    updateMutation.mutate(
      pickChangedFields(currentValues, originalValues, [...profileFields])
    );
  }

  if (profileQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  if (profileQuery.isError || !profile) {
    return <p className="text-sm text-red-600">Failed to load profile.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">Account</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">My profile</h1>
        <p className="mt-2 text-slate-600">View and update your account details.</p>
      </section>

      <ProfileSummary profile={profile} />

      {(error || success) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">Edit profile</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              icon={<HiUser className="h-5 w-5 text-brand-600" />}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Admin"
              icon={<HiUser className="h-5 w-5 text-brand-600" />}
            />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<HiEnvelope className="h-5 w-5 text-brand-600" />}
          />
        </FormField>

        <FormActions
          submitLabel="Save changes"
          loading={updateMutation.isPending}
          loadingText="Saving…"
          submitDisabled={!hasChanges}
        />
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your password to keep your account secure.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={<HiLockClosed className="h-4 w-4 text-amber-500" />}
            onClick={() => {
              setError('');
              setSuccess('');
              setPasswordModalOpen(true);
            }}
          >
            Change password
          </Button>
        </div>
      </section>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setError('');
          setSuccess('Password updated successfully.');
        }}
      />
    </div>
  );
}

function ProfileSummary({ profile }: { profile: UserProfile }) {
  return (
    <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
      <SummaryItem label="Role" value={roleLabel(profile.role)} />
      <SummaryItem label="Status" value={profile.isActive ? 'Active' : 'Inactive'} />
      {profile.companyName && <SummaryItem label="Company" value={profile.companyName} />}
      {profile.role === 'super_admin' && (
        <SummaryItem label="Scope" value="Platform (super admin)" />
      )}
      <SummaryItem label="Member since" value={formatDate(profile.createdAt)} />
      <SummaryItem label="Last updated" value={formatDate(profile.updatedAt)} />
    </dl>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium capitalize text-slate-900">{value}</dd>
    </div>
  );
}
