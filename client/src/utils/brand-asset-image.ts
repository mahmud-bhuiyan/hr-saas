import type { UploadPlatformAssetInput } from "../types";

const FAVICON_OUTPUT_SIZE = 64;
const LOGO_MAX_WIDTH = 800;
const LOGO_MAX_HEIGHT = 240;

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for processing"));
    };
    image.src = objectUrl;
  });

const canvasToPngDataUrl = (canvas: HTMLCanvasElement): string =>
  canvas.toDataURL("image/png");

const toBase64Payload = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
};

const drawContained = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const scale = Math.min(
    canvasWidth / image.naturalWidth,
    canvasHeight / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(image, x, y, width, height);
};

const normalizeFavicon = (image: HTMLImageElement): string => {
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sx = (image.naturalWidth - sourceSize) / 2;
  const sy = (image.naturalHeight - sourceSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = FAVICON_OUTPUT_SIZE;
  canvas.height = FAVICON_OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available");
  }

  ctx.clearRect(0, 0, FAVICON_OUTPUT_SIZE, FAVICON_OUTPUT_SIZE);
  ctx.drawImage(
    image,
    sx,
    sy,
    sourceSize,
    sourceSize,
    0,
    0,
    FAVICON_OUTPUT_SIZE,
    FAVICON_OUTPUT_SIZE,
  );

  return canvasToPngDataUrl(canvas);
};

const normalizeLogo = (image: HTMLImageElement): string => {
  const scale = Math.min(
    1,
    LOGO_MAX_WIDTH / image.naturalWidth,
    LOGO_MAX_HEIGHT / image.naturalHeight,
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available");
  }

  drawContained(ctx, image, width, height);
  return canvasToPngDataUrl(canvas);
};

/**
 * Converts an uploaded image into a hosted-ready PNG payload.
 * Favicon → center-cropped square 64×64 PNG.
 * Logo → aspect-preserved PNG capped at 800×240.
 */
export const normalizeBrandAssetFile = async (
  file: File,
  asset: "logo" | "favicon",
): Promise<Pick<UploadPlatformAssetInput, "imageBase64" | "filename">> => {
  const image = await loadImageFromFile(file);
  const dataUrl =
    asset === "favicon" ? normalizeFavicon(image) : normalizeLogo(image);
  const baseName = file.name.replace(/\.[^.]+$/, "") || asset;

  return {
    imageBase64: toBase64Payload(dataUrl),
    filename: `${baseName}.png`,
  };
};
