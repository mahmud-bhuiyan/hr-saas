import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { FormModal } from '../components/ui/FormModal';
import { ApiError, approveRegistration, fetchPendingRegistrations, rejectRegistration } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { RegistrationRequest } from '../types';

function adminName(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }
  return email ?? 'Unknown';
}

export function RegistrationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const registrationsQuery = useQuery({
    queryKey: ['registrations', 'pending'],
    queryFn: fetchPendingRegistrations,
    enabled: user?.role === 'super_admin',
  });

  const approveMutation = useMutation({
    mutationFn: approveRegistration,
    onSuccess: () => {
      setActionError('');
      void queryClient.invalidateQueries({ queryKey: ['registrations', 'pending'] });
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Approval failed');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) =>
      rejectRegistration(tenantId, reason),
    onSuccess: () => {
      setActionError('');
      setRejectTarget(null);
      setRejectReason('');
      void queryClient.invalidateQueries({ queryKey: ['registrations', 'pending'] });
    },
    onError: (err) => {
      setRejectError(err instanceof ApiError ? err.message : 'Rejection failed');
    },
  });

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const registrations = registrationsQuery.data ?? [];

  function openRejectModal(item: RegistrationRequest) {
    setRejectTarget(item);
    setRejectReason('');
    setRejectError('');
  }

  function closeRejectModal() {
    if (!rejectMutation.isPending) {
      setRejectTarget(null);
      setRejectReason('');
    }
  }

  function handleRejectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectTarget) {
      return;
    }
    rejectMutation.mutate({
      tenantId: rejectTarget.tenantId,
      reason: rejectReason || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">Super admin</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Company registrations</h1>
        <p className="mt-2 text-slate-600">
          Review and approve new company sign-up requests before they can access the platform.
        </p>
      </section>

      {actionError && !rejectTarget && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {registrationsQuery.isLoading && (
        <p className="text-sm text-slate-500">Loading pending registrations…</p>
      )}

      {registrationsQuery.isError && (
        <p className="text-sm text-red-600">Failed to load registrations.</p>
      )}

      {!registrationsQuery.isLoading && registrations.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No pending company registrations.
        </div>
      )}

      <ul className="space-y-4">
        {registrations.map((item) => (
          <li
            key={item.tenantId}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{item.companyName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {adminName(item.adminFirstName, item.adminLastName, item.adminEmail)} ·{' '}
                  {item.adminEmail}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Submitted {new Date(item.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  onClick={() => approveMutation.mutate(item.tenantId)}
                  loading={approveMutation.isPending && approveMutation.variables === item.tenantId}
                  loadingText="Approving…"
                  disabled={rejectMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openRejectModal(item)}
                  disabled={approveMutation.isPending}
                >
                  Reject
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <FormModal
        open={Boolean(rejectTarget)}
        onClose={closeRejectModal}
        onSubmit={handleRejectSubmit}
        title="Reject registration"
        description={
          rejectTarget
            ? `Reject ${rejectTarget.companyName}? The company admin will see your reason on login.`
            : undefined
        }
        submitLabel="Confirm reject"
        submitVariant="danger"
        loading={rejectMutation.isPending}
        error={rejectError}
        size="sm"
      >
        <FormField label="Rejection reason (optional)" htmlFor="reject-reason">
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Reason shown to the company admin on login"
          />
        </FormField>
      </FormModal>
    </div>
  );
}
