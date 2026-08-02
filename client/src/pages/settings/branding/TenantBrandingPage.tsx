import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import {
  ApiError,
  fetchSiteConfig,
  fetchTenantBrandingOverrides,
  updateTenantBranding,
} from '../../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../../utils/form';
import {
  TenantBrandingForm,
  TenantBrandingPreview,
  type TenantBrandingFormValues,
} from './components/TenantBrandingForm';

const formKeys = ['primaryColor', 'logoUrl'] as const;

const toFormValues = (overrides: {
  primaryColor: string | null;
  logoUrl: string | null;
}): TenantBrandingFormValues => ({
  primaryColor: overrides.primaryColor ?? '',
  logoUrl: overrides.logoUrl ?? '',
});

import type { PatchTenantBrandingInput } from '../../../types';

const toPatchInput = (
  values: TenantBrandingFormValues,
  original: TenantBrandingFormValues
): PatchTenantBrandingInput => {
  const changed = pickChangedFields(values, original, [...formKeys]);
  const input: PatchTenantBrandingInput = {};

  if (changed.primaryColor !== undefined) {
    input.primaryColor = String(changed.primaryColor) || null;
  }
  if (changed.logoUrl !== undefined) {
    input.logoUrl = String(changed.logoUrl) || null;
  }

  return input;
};

export const TenantBrandingPage = () => {
  const { user } = useAuth();
  const { displayName, refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<TenantBrandingFormValues | null>(null);
  const [original, setOriginal] = useState<TenantBrandingFormValues | null>(null);

  const platformQuery = useQuery({
    queryKey: ['platform', 'site-config'],
    queryFn: fetchSiteConfig,
    enabled: user?.role === 'company_admin',
  });

  const overridesQuery = useQuery({
    queryKey: ['settings', 'branding', 'overrides'],
    queryFn: fetchTenantBrandingOverrides,
    enabled: user?.role === 'company_admin',
  });

  useEffect(() => {
    if (overridesQuery.data) {
      const formValues = toFormValues(overridesQuery.data);
      setValues(formValues);
      setOriginal(formValues);
    }
  }, [overridesQuery.data]);

  const hasChanges = useMemo(() => {
    if (!values || !original) {
      return false;
    }
    return hasFormChanges(values, original, [...formKeys]);
  }, [values, original]);

  const updateMutation = useMutation({
    mutationFn: updateTenantBranding,
    onSuccess: async () => {
      toast.success('Company branding updated.');
      void queryClient.invalidateQueries({ queryKey: ['settings', 'branding'] });
      await refresh();
      const refreshed = await fetchTenantBrandingOverrides();
      const formValues = toFormValues(refreshed);
      setValues(formValues);
      setOriginal(formValues);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update company branding');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values || !original || !hasChanges) {
      return;
    }
    updateMutation.mutate(toPatchInput(values, original));
  };

  const handleClearField = (field: keyof TenantBrandingFormValues) => {
    setValues((prev) => (prev ? { ...prev, [field]: '' } : prev));
  };

  if (user?.role !== 'company_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (overridesQuery.isLoading || platformQuery.isLoading || !values) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading branding settings…</p>
      </PageContainer>
    );
  }

  if (overridesQuery.isError || platformQuery.isError) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load branding settings.</p>
      </PageContainer>
    );
  }

  const platformPrimaryColor = platformQuery.data?.primaryColor ?? '#2563eb';

  return (
    <PageContainer className="space-y-8">
      <Link
        to="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <PageHeader
        label="Settings"
        title="Company branding"
        description="Customize your company's logo and theme color. Overrides apply to all users in your organization."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TenantBrandingForm
          values={values}
          platformPrimaryColor={platformPrimaryColor}
          onChange={(field, value) => setValues((prev) => (prev ? { ...prev, [field]: value } : prev))}
          onClearField={handleClearField}
          onSubmit={handleSubmit}
          loading={updateMutation.isPending}
          hasChanges={hasChanges}
        />
        <TenantBrandingPreview
          values={values}
          platformPrimaryColor={platformPrimaryColor}
          displayName={displayName}
        />
      </div>
    </PageContainer>
  );
};
