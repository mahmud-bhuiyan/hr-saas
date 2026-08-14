import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { APP_NAME } from '../constants/app';
import { DEFAULT_FAVICON_DISPLAY, DEFAULT_LOGO_DISPLAY, DEFAULT_SIDEBAR_DISPLAY } from '../constants/branding';
import { fetchEffectiveBranding, fetchSiteConfig } from '../lib/api';
import { applyDocumentBranding } from '../utils/theme';
import { isAnyQueryInitialLoad } from '../utils/query';
import type { SiteConfig } from '../types';
import { useAuth } from './AuthContext';

interface SiteConfigContextValue {
  config: SiteConfig;
  displayName: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const defaultConfig: SiteConfig = {
  siteName: APP_NAME,
  logoUrl: null,
  faviconUrl: null,
  logoDisplay: { ...DEFAULT_LOGO_DISPLAY },
  faviconDisplay: { ...DEFAULT_FAVICON_DISPLAY },
  sidebarDisplay: { ...DEFAULT_SIDEBAR_DISPLAY },
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [displayName, setDisplayName] = useState(APP_NAME);

  const publicQuery = useQuery({
    queryKey: ['platform', 'site-config'],
    queryFn: fetchSiteConfig,
  });

  const effectiveQuery = useQuery({
    queryKey: ['settings', 'branding', user?.id],
    queryFn: fetchEffectiveBranding,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && effectiveQuery.data) {
      setConfig(effectiveQuery.data);
      setDisplayName(effectiveQuery.data.tenantDisplayName ?? effectiveQuery.data.siteName);
      return;
    }

    if (publicQuery.data) {
      setConfig(publicQuery.data);
      setDisplayName(publicQuery.data.siteName);
    }
  }, [isAuthenticated, publicQuery.data, effectiveQuery.data]);

  useEffect(() => {
    void applyDocumentBranding(config.siteName, config.faviconUrl, config.faviconDisplay);
  }, [config]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['platform', 'site-config'] });
    await queryClient.invalidateQueries({ queryKey: ['settings', 'branding'] });
  }, [queryClient]);

  const isLoading = isAnyQueryInitialLoad(
    publicQuery,
    ...(isAuthenticated ? [effectiveQuery] : [])
  );

  const value = useMemo(
    () => ({
      config,
      displayName,
      isLoading,
      refresh,
    }),
    [config, displayName, isLoading, refresh]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = (): SiteConfigContextValue => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within SiteConfigProvider');
  }
  return context;
};
