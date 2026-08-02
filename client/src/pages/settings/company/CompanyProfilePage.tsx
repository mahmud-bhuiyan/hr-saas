import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import { ApiError, fetchCompanyProfile, updateCompanyProfile } from '../../../lib/api';
import type { CompanyProfile, PatchCompanyProfileInput } from '../../../types';
import { hasFormChanges, pickChangedFields } from '../../../utils/form';
import {
  CompanyProfileForm,
  type CompanyProfileFormValues,
} from './components/CompanyProfileForm';

const formKeys = ['name', 'address', 'logoUrl'] as const;

const toFormValues = (profile: CompanyProfile): CompanyProfileFormValues => ({
  name: profile.name,
  address: profile.address ?? '',
  logoUrl: profile.logoUrl ?? '',
});

const toPatchInput = (
  values: CompanyProfileFormValues,
  original: CompanyProfileFormValues
): PatchCompanyProfileInput => {
  const changed = pickChangedFields(
    values as unknown as Record<string, unknown>,
    original as unknown as Record<string, unknown>,
    [...formKeys]
  );
  const input: PatchCompanyProfileInput = {};

  if (changed.name !== undefined) {
    input.name = String(changed.name);
  }
  if (changed.address !== undefined) {
    input.address = String(changed.address);
  }
  if (changed.logoUrl !== undefined) {
    input.logoUrl = String(changed.logoUrl) || null;
  }

  return input;
};

export const CompanyProfilePage = () => {
  const { user } = useAuth();
  const { refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CompanyProfileFormValues | null>(null);
  const [original, setOriginal] = useState<CompanyProfileFormValues | null>(null);

  const profileQuery = useQuery({
    queryKey: ['settings', 'company'],
    queryFn: fetchCompanyProfile,
    enabled: user?.role === 'company_admin',
  });

  useEffect(() => {
    if (profileQuery.data) {
      const formValues = toFormValues(profileQuery.data);
      setValues(formValues);
      setOriginal(formValues);
    }
  }, [profileQuery.data]);

  const hasChanges = useMemo(() => {
    if (!values || !original) {
      return false;
    }
    return hasFormChanges(
      values as unknown as Record<string, unknown>,
      original as unknown as Record<string, unknown>,
      [...formKeys]
    );
  }, [values, original]);

  const updateMutation = useMutation({
    mutationFn: updateCompanyProfile,
    onSuccess: async (profile) => {
      toast.success('Company profile updated.');
      void queryClient.invalidateQueries({ queryKey: ['settings', 'company'] });
      await refresh();
      const formValues = toFormValues(profile);
      setValues(formValues);
      setOriginal(formValues);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update company profile');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values || !original || !hasChanges) {
      return;
    }
    updateMutation.mutate(toPatchInput(values, original));
  };

  if (user?.role !== 'company_admin') {
    return <Navigate to="/dashboard/settings" replace />;
  }

  if (profileQuery.isLoading || !values) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading company profile…</p>
      </PageContainer>
    );
  }

  if (profileQuery.isError) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load company profile.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <Link
        to="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <PageHeader
        label="Settings"
        title="Company profile"
        description="Update your company name, address, and logo shown across the platform."
      />

      <CompanyProfileForm
        values={values}
        onChange={(field, value) => setValues((prev) => (prev ? { ...prev, [field]: value } : prev))}
        onSubmit={handleSubmit}
        loading={updateMutation.isPending}
        hasChanges={hasChanges}
      />
    </PageContainer>
  );
};
