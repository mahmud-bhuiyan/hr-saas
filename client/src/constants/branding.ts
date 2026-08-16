export type LogoObjectFit = 'contain' | 'cover';

export type LogoShape = 'default' | 'rounded' | 'circle' | 'square';

export type FaviconMimeType =
  | 'auto'
  | 'image/png'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'image/webp';

export const LOGO_SHAPE_OPTIONS: { value: LogoShape; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
];

/** Guidance for favicon assets so circle/square clips render cleanly. */
export const FAVICON_IMAGE_SIZE_HINT =
  "Square mark preferred. Uploads auto-crop to 64×64 PNG.";

export const LOGO_IMAGE_SIZE_HINT =
  "Wide logos work best. Uploads optimize to PNG (max 800×240).";

export const DEFAULT_LOGO_DISPLAY = {
  heightPx: 32,
  maxWidthPx: 160,
  objectFit: 'contain' as LogoObjectFit,
  shape: 'circle' as LogoShape,
  showSiteName: false,
};

export const DEFAULT_FAVICON_DISPLAY = {
  mimeType: 'auto' as FaviconMimeType,
  shape: 'circle' as LogoShape,
};

export const DEFAULT_SIDEBAR_DISPLAY = {
  behavior: 'fixed_collapsed' as const,
  collapsedWidthPx: 104,
  expandedWidthPx: 256,
};

export const inferFaviconMimeType = (url: string | null): string | undefined => {
  if (!url) {
    return undefined;
  }
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.ico')) {
    return 'image/x-icon';
  }
  return undefined;
};

export const resolveFaviconMimeType = (
  url: string | null,
  mimeType: FaviconMimeType
): string | undefined => {
  if (mimeType !== 'auto') {
    return mimeType;
  }
  return inferFaviconMimeType(url);
};
