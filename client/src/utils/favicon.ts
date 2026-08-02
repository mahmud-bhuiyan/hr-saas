const DEFAULT_BRAND_IMAGE_SIZE = 64;
const PADDING_RATIO = 0.14;

const drawRoundedWhiteBackground = (
  ctx: CanvasRenderingContext2D,
  size: number
): void => {
  const radius = size / 2;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
};

const drawImageContained = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  size: number,
  sourceWidth: number,
  sourceHeight: number
): void => {
  const padding = size * PADDING_RATIO;
  const inner = size - padding * 2;
  const scale = Math.min(inner / sourceWidth, inner / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  ctx.drawImage(image, x, y, width, height);
};

const loadImageElement = (url: string, crossOrigin: boolean): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (crossOrigin) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load brand image'));
    image.src = url;
  });

const loadImageViaFetch = async (url: string): Promise<HTMLImageElement> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch brand image');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await loadImageElement(objectUrl, false);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const loadBrandImage = async (url: string): Promise<HTMLImageElement> => {
  try {
    return await loadImageViaFetch(url);
  } catch {
    return loadImageElement(url, true);
  }
};

const renderStyledBrandImage = (
  image: CanvasImageSource,
  width: number,
  height: number,
  size: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable');
  }

  drawRoundedWhiteBackground(ctx, size);
  drawImageContained(ctx, image, size, width, height);

  return canvas.toDataURL('image/png');
};

export const buildDefaultBrandImageUrl = (
  label = 'HR',
  size = DEFAULT_BRAND_IMAGE_SIZE
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  drawRoundedWhiteBackground(ctx, size);

  ctx.fillStyle = '#2563eb';
  ctx.font = `bold ${Math.round(size * 0.375)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.slice(0, 2).toUpperCase(), size / 2, size / 2 + 1);

  return canvas.toDataURL('image/png');
};

export const buildStyledBrandImageUrl = async (
  sourceUrl: string,
  fallbackLabel = 'HR',
  size = DEFAULT_BRAND_IMAGE_SIZE
): Promise<string> => {
  try {
    const image = await loadBrandImage(sourceUrl);
    return renderStyledBrandImage(image, image.naturalWidth, image.naturalHeight, size);
  } catch {
    return buildDefaultBrandImageUrl(fallbackLabel, size);
  }
};

export const resolveDocumentFaviconUrl = async (
  faviconUrl: string | null,
  siteName: string
): Promise<string> => {
  const fallbackLabel = siteName.slice(0, 2) || 'HR';

  if (!faviconUrl) {
    return buildDefaultBrandImageUrl(fallbackLabel);
  }

  return buildStyledBrandImageUrl(faviconUrl, fallbackLabel);
};
