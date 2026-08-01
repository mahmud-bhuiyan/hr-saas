import { z } from 'zod';

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color (#RRGGBB)');

const optionalUrlSchema = z.union([
  z.string().trim().url('Must be a valid URL'),
  z.null(),
  z.literal(''),
]);

const logoDisplaySchema = z
  .object({
    heightPx: z.number().int().min(24).max(80).optional(),
    maxWidthPx: z.number().int().min(80).max(320).optional(),
    objectFit: z.enum(['contain', 'cover']).optional(),
    showSiteName: z.boolean().optional(),
  })
  .optional();

const faviconDisplaySchema = z
  .object({
    mimeType: z
      .enum(['auto', 'image/png', 'image/x-icon', 'image/svg+xml', 'image/webp'])
      .optional(),
  })
  .optional();

export const patchPlatformSettingsSchema = z
  .object({
    siteName: z.string().trim().min(2, 'Site name must be at least 2 characters').max(64).optional(),
    logoUrl: optionalUrlSchema.optional(),
    faviconUrl: optionalUrlSchema.optional(),
    primaryColor: hexColorSchema.optional(),
    logoDisplay: logoDisplaySchema,
    faviconDisplay: faviconDisplaySchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const uploadPlatformAssetSchema = z.object({
  asset: z.enum(['logo', 'favicon']),
  imageBase64: z.string().min(1, 'Image data is required'),
  filename: z.string().trim().min(1, 'Filename is required').max(255),
});

export const patchTenantBrandingSchema = z
  .object({
    logoUrl: optionalUrlSchema.optional(),
    primaryColor: z.union([hexColorSchema, z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type PatchPlatformSettingsInput = z.infer<typeof patchPlatformSettingsSchema>;
export type UploadPlatformAssetInput = z.infer<typeof uploadPlatformAssetSchema>;
export type PatchTenantBrandingInput = z.infer<typeof patchTenantBrandingSchema>;

export const stripDataUrlPrefix = (value: string): string => {
  const match = value.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : value;
};
