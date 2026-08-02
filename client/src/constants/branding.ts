export type LogoObjectFit = 'contain' | 'cover';

export type LogoShape = 'default' | 'circle';

export type FaviconMimeType =
  | 'auto'
  | 'image/png'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'image/webp';

export const DEFAULT_LOGO_DISPLAY = {
  heightPx: 32,
  maxWidthPx: 160,
  objectFit: 'contain' as LogoObjectFit,
  shape: 'circle' as LogoShape,
  showSiteName: false,
};

export const DEFAULT_FAVICON_DISPLAY = {
  mimeType: 'auto' as FaviconMimeType,
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
