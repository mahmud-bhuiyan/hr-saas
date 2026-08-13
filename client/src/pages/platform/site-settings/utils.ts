import { hasFormChanges, pickChangedFields } from '../../../utils/form';
import type { PatchPlatformSiteSettingsInput } from '../../../types';
import type { SiteSettingsFormValues } from './components/SiteSettingsForm';

export type SiteSettingsTab = 'general' | 'logo' | 'favicon' | 'sidebar';

export const SITE_SETTINGS_TAB_IDS = [
  'general',
  'logo',
  'favicon',
  'sidebar',
] as const satisfies readonly SiteSettingsTab[];

export const SITE_SETTINGS_TAB_KEYS: Record<
  SiteSettingsTab,
  Array<keyof SiteSettingsFormValues>
> = {
  general: ['siteName'],
  logo: [
    'logoUrl',
    'logoHeightPx',
    'logoMaxWidthPx',
    'logoObjectFit',
    'logoShape',
    'logoShowSiteName',
  ],
  favicon: ['faviconUrl'],
  sidebar: ['sidebarBehavior', 'sidebarCollapsedWidthPx', 'sidebarExpandedWidthPx'],
};

export const SITE_SETTINGS_TAB_SUCCESS: Record<SiteSettingsTab, string> = {
  general: 'General settings saved.',
  logo: 'Logo settings saved.',
  favicon: 'Favicon settings saved.',
  sidebar: 'Sidebar settings saved.',
};

export const hasTabChanges = (
  tab: SiteSettingsTab,
  values: SiteSettingsFormValues,
  original: SiteSettingsFormValues
): boolean => hasFormChanges(values, original, SITE_SETTINGS_TAB_KEYS[tab]);

export const toTabPatchInput = (
  tab: SiteSettingsTab,
  values: SiteSettingsFormValues,
  original: SiteSettingsFormValues
): PatchPlatformSiteSettingsInput => {
  const changed = pickChangedFields(values, original, SITE_SETTINGS_TAB_KEYS[tab]);
  const input: PatchPlatformSiteSettingsInput = {};

  if (changed.siteName !== undefined) {
    input.siteName = String(changed.siteName);
  }

  if (changed.logoUrl !== undefined) {
    input.logoUrl = changed.logoUrl ? String(changed.logoUrl) : null;
  }

  if (changed.faviconUrl !== undefined) {
    input.faviconUrl = changed.faviconUrl ? String(changed.faviconUrl) : null;
  }

  const logoDisplayChanged =
    changed.logoHeightPx !== undefined ||
    changed.logoMaxWidthPx !== undefined ||
    changed.logoObjectFit !== undefined ||
    changed.logoShape !== undefined ||
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
    if (changed.logoShape !== undefined) {
      input.logoDisplay.shape = changed.logoShape as SiteSettingsFormValues['logoShape'];
    }
    if (changed.logoShowSiteName !== undefined) {
      input.logoDisplay.showSiteName = Boolean(changed.logoShowSiteName);
    }
  }

  const sidebarDisplayChanged =
    changed.sidebarBehavior !== undefined ||
    changed.sidebarCollapsedWidthPx !== undefined ||
    changed.sidebarExpandedWidthPx !== undefined;

  if (sidebarDisplayChanged) {
    input.sidebarDisplay = {};
    if (changed.sidebarBehavior !== undefined) {
      input.sidebarDisplay.behavior = changed.sidebarBehavior as SiteSettingsFormValues['sidebarBehavior'];
    }
    if (changed.sidebarCollapsedWidthPx !== undefined) {
      input.sidebarDisplay.collapsedWidthPx = Number(changed.sidebarCollapsedWidthPx);
    }
    if (changed.sidebarExpandedWidthPx !== undefined) {
      input.sidebarDisplay.expandedWidthPx = Number(changed.sidebarExpandedWidthPx);
    }
  }

  return input;
};
