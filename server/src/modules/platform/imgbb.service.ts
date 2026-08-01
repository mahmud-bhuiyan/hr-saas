import type { ServerEnv } from '../../config/env.js';

export class ImgbbServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ImgbbServiceError';
  }
}

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const FAVICON_MAX_BYTES = 512 * 1024;

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'ico']);

const estimateBase64Bytes = (base64: string): number => Math.ceil((base64.length * 3) / 4);

const getExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? (parts.pop() ?? '') : '';
};

interface ImgbbUploadResponse {
  data?: {
    url?: string;
    display_url?: string;
  };
  success?: boolean;
  error?: {
    message?: string;
  };
}

export const uploadPlatformAssetToImgbb = async (
  env: ServerEnv,
  asset: 'logo' | 'favicon',
  imageBase64: string,
  filename: string
): Promise<string> => {
  if (!env.imgbbApiKey) {
    throw new ImgbbServiceError('Image upload is not configured (IMGBB_API_KEY missing)', 503);
  }

  const extension = getExtension(filename);
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    throw new ImgbbServiceError(
      'Unsupported file type. Use PNG, JPEG, WebP, SVG, or ICO.',
      400
    );
  }

  const maxBytes = asset === 'logo' ? LOGO_MAX_BYTES : FAVICON_MAX_BYTES;
  const estimatedBytes = estimateBase64Bytes(imageBase64);
  if (estimatedBytes > maxBytes) {
    const maxLabel = asset === 'logo' ? '2 MB' : '512 KB';
    throw new ImgbbServiceError(`File exceeds ${maxLabel} limit`, 400);
  }

  const body = new URLSearchParams();
  body.set('image', imageBase64);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(env.imgbbApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  );

  const json = (await response.json()) as ImgbbUploadResponse;

  if (!response.ok || !json.success) {
    throw new ImgbbServiceError(
      json.error?.message ?? 'Failed to upload image to ImgBB',
      502
    );
  }

  const url = json.data?.url ?? json.data?.display_url;
  if (!url) {
    throw new ImgbbServiceError('ImgBB did not return an image URL', 502);
  }

  return url;
};
