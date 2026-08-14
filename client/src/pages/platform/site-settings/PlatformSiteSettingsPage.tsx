import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, fetchPlatformSiteSettings, updatePlatformSiteSettings } from '../../../lib/api';
import { toast } from 'react-toastify';
import type { PatchPlatformSiteSettingsInput, PlatformSiteSettings } from '../../../types';
import {
  SiteSettingsForm,
  type SiteSettingsFormValues,
} from './components/SiteSettingsForm';
import {
  hasTabChanges,
  SITE_SETTINGS_TAB_SUCCESS,
  toTabPatchInput,
  type SiteSettingsTab,
} from './utils';

const toFormValues = (settings: PlatformSiteSettings): SiteSettingsFormValues => ({
  siteName: settings.siteName,
  logoUrl: settings.logoUrl ?? '',
  faviconUrl: settings.faviconUrl ?? '',
  logoHeightPx: settings.logoDisplay.heightPx,
  logoMaxWidthPx: settings.logoDisplay.maxWidthPx,
  logoObjectFit: settings.logoDisplay.objectFit,
  logoShape: settings.logoDisplay.shape,
  logoShowSiteName: settings.logoDisplay.showSiteName,
  sidebarBehavior: settings.sidebarDisplay.behavior,
  sidebarCollapsedWidthPx: settings.sidebarDisplay.collapsedWidthPx,
  sidebarExpandedWidthPx: settings.sidebarDisplay.expandedWidthPx,
});

export const PlatformSiteSettingsPage = () => {
  const { user } = useAuth();
  const { refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SiteSettingsFormValues | null>(null);
  const [original, setOriginal] = useState<SiteSettingsFormValues | null>(null);
  const [savingTab, setSavingTab] = useState<SiteSettingsTab | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['platform', 'site-settings'],
    queryFn: fetchPlatformSiteSettings,
    enabled: user?.role === 'super_admin',
  });

  useEffect(() => {
    if (settingsQuery.data) {
      const formValues = toFormValues(settingsQuery.data);
      setValues(formValues);
      setOriginal(formValues);
    }
  }, [settingsQuery.data]);

  const tabChanges = useMemo(() => {
    if (!values || !original) {
      return {
        general: false,
        logo: false,
        favicon: false,
        sidebar: false,
      };
    }

    return {
      general: hasTabChanges('general', values, original),
      logo: hasTabChanges('logo', values, original),
      favicon: hasTabChanges('favicon', values, original),
      sidebar: hasTabChanges('sidebar', values, original),
    };
  }, [values, original]);

  const applySuccess = useCallback(
    async (data: PlatformSiteSettings, tab: SiteSettingsTab) => {
      const formValues = toFormValues(data);
      setValues(formValues);
      setOriginal(formValues);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'site-settings'] });
      await refresh();
      toast.success(SITE_SETTINGS_TAB_SUCCESS[tab]);
      setSavingTab(null);
    },
    [queryClient, refresh]
  );

  const updateMutation = useMutation({
    mutationFn: ({
      input,
    }: {
      tab: SiteSettingsTab;
      input: PatchPlatformSiteSettingsInput;
    }) => updatePlatformSiteSettings(input),
    onSuccess: async (data, variables) => {
      await applySuccess(data, variables.tab);
    },
    onError: (err) => {
      setSavingTab(null);
      toast.error(err instanceof ApiError ? err.message : 'Failed to update site settings');
    },
  });

  const handleSubmit = (tab: SiteSettingsTab, e: FormEvent) => {
    e.preventDefault();
    if (!values || !original || !tabChanges[tab]) {
      return;
    }
    setSavingTab(tab);
    updateMutation.mutate({ tab, input: toTabPatchInput(tab, values, original) });
  };

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (settingsQuery.isLoading || !values || !original) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading site settings…</p>
      </PageContainer>
    );
  }

  if (settingsQuery.isError) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load site settings.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Super admin"
        title="Site settings"
        description="Customize platform-wide branding visible on login, register, and the app shell."
      />

      <SiteSettingsForm
        values={values}
        onChange={(field, value) =>
          setValues((prev) => (prev ? { ...prev, [field]: value } : prev))
        }
        onSubmit={handleSubmit}
        savingTab={updateMutation.isPending ? savingTab : null}
        tabChanges={tabChanges}
      />
    </PageContainer>
  );
};
