import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useSiteConfig } from '../../../contexts/SiteConfigContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, fetchPlatformSiteSettings, updatePlatformSiteSettings } from '../../../lib/api';
import { toast } from 'react-toastify';
import { hasFormChanges, pickChangedFields } from '../../../utils/form';
import type { PatchPlatformSiteSettingsInput, PlatformSiteSettings } from '../../../types';
import {
  SiteSettingsForm,
  SiteSettingsPreview,
  type SiteSettingsFormValues,
} from './components/SiteSettingsForm';

const settingsFormKeys = [
  'siteName',
  'logoHeightPx',
  'logoMaxWidthPx',
  'logoObjectFit',
  'logoShowSiteName',
  'faviconMimeType',
] as const;

const toFormValues = (settings: PlatformSiteSettings): SiteSettingsFormValues => ({
  siteName: settings.siteName,
  primaryColor: settings.primaryColor,
  logoUrl: settings.logoUrl ?? '',
  faviconUrl: settings.faviconUrl ?? '',
  logoHeightPx: settings.logoDisplay.heightPx,
  logoMaxWidthPx: settings.logoDisplay.maxWidthPx,
  logoObjectFit: settings.logoDisplay.objectFit,
  logoShowSiteName: settings.logoDisplay.showSiteName,
  faviconMimeType: settings.faviconDisplay.mimeType,
});

const toSettingsPatchInput = (
  values: SiteSettingsFormValues,
  original: SiteSettingsFormValues
): PatchPlatformSiteSettingsInput => {
  const changed = pickChangedFields(values, original, [...settingsFormKeys]);
  const input: PatchPlatformSiteSettingsInput = {};

  if (changed.siteName !== undefined) {
    input.siteName = String(changed.siteName);
  }

  const logoDisplayChanged =
    changed.logoHeightPx !== undefined ||
    changed.logoMaxWidthPx !== undefined ||
    changed.logoObjectFit !== undefined ||
    changed.logoShowSiteName !== undefined;

  if (logoDisplayChanged) {
    input.logoDisplay = {};
    if (changed.logoHeightPx !== undefined) {
      input.logoDisplay.heightPx = Number(changed.logoHeightPx);
    }
    if (changed.logoMaxWidthPx !== undefined) {
      input.logoDisplay.maxWidthPx = Number(changed.logoMaxWidthPx);
    }
    if (changed.logoObjectFit !== undefined) {
      input.logoDisplay.objectFit = changed.logoObjectFit as SiteSettingsFormValues['logoObjectFit'];
    }
    if (changed.logoShowSiteName !== undefined) {
      input.logoDisplay.showSiteName = Boolean(changed.logoShowSiteName);
    }
  }

  if (changed.faviconMimeType !== undefined) {
    input.faviconDisplay = {
      mimeType: changed.faviconMimeType as SiteSettingsFormValues['faviconMimeType'],
    };
  }

  return input;
};

type SaveAction = 'settings' | 'logo' | 'favicon' | 'color';

export const PlatformSiteSettingsPage = () => {
  const { user } = useAuth();
  const { refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SiteSettingsFormValues | null>(null);
  const [original, setOriginal] = useState<SiteSettingsFormValues | null>(null);
  const [saveAction, setSaveAction] = useState<SaveAction | null>(null);

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

  const hasSettingsChanges = useMemo(() => {
    if (!values || !original) {
      return false;
    }
    return hasFormChanges(values, original, [...settingsFormKeys]);
  }, [values, original]);

  const applySuccess = useCallback(
    async (data: PlatformSiteSettings, message: string) => {
      const formValues = toFormValues(data);
      setValues(formValues);
      setOriginal(formValues);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'site-settings'] });
      await refresh();
      toast.success(message);
    },
    [queryClient, refresh]
  );

  const updateMutation = useMutation({
    mutationFn: updatePlatformSiteSettings,
    onSuccess: async (data) => {
      const messages: Record<SaveAction, string> = {
        settings: 'Display settings saved.',
        logo: 'Logo saved.',
        favicon: 'Favicon saved.',
        color: 'Theme color applied.',
      };
      const action = saveAction ?? 'settings';
      await applySuccess(data, messages[action]);
      setSaveAction(null);
    },
    onError: (err) => {
      setSaveAction(null);
      toast.error(err instanceof ApiError ? err.message : 'Failed to update site settings');
    },
  });

  const patch = useCallback(
    (input: PatchPlatformSiteSettingsInput, action: SaveAction) => {
      setSaveAction(action);
      updateMutation.mutate(input);
    },
    [updateMutation]
  );

  const handleLogoSave = useCallback(
    async (url: string) => {
      patch({ logoUrl: url || null }, 'logo');
    },
    [patch]
  );

  const handleFaviconSave = useCallback(
    async (url: string) => {
      patch({ faviconUrl: url || null }, 'favicon');
    },
    [patch]
  );

  const handleApplyColor = useCallback(() => {
    if (!values) {
      return;
    }
    patch({ primaryColor: values.primaryColor }, 'color');
  }, [patch, values]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values || !original || !hasSettingsChanges) {
      return;
    }
    patch(toSettingsPatchInput(values, original), 'settings');
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

      <div className="grid gap-6 lg:grid-cols-2">
        <SiteSettingsForm
          values={values}
          savedLogoUrl={original.logoUrl}
          savedFaviconUrl={original.faviconUrl}
          savedPrimaryColor={original.primaryColor}
          onChange={(field, value) =>
            setValues((prev) => (prev ? { ...prev, [field]: value } : prev))
          }
          onLogoSave={handleLogoSave}
          onFaviconSave={handleFaviconSave}
          onApplyColor={handleApplyColor}
          onSubmit={handleSubmit}
          loading={updateMutation.isPending && saveAction === 'settings'}
          logoSaving={updateMutation.isPending && saveAction === 'logo'}
          faviconSaving={updateMutation.isPending && saveAction === 'favicon'}
          colorSaving={updateMutation.isPending && saveAction === 'color'}
          hasSettingsChanges={hasSettingsChanges}
        />
        <SiteSettingsPreview values={values} />
      </div>
    </PageContainer>
  );
};
