import { z } from 'zod';

export const uploadAvatarSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  filename: z.string().trim().min(1, 'Filename is required').max(255),
});

export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: z.string().email().transform((v) => v.toLowerCase().trim()).optional(),
    avatarUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
    colorScheme: z.enum(['light', 'dark']).optional(),
    themeColor: z.enum(['purple', 'blue', 'pink', 'green', 'orange']).optional(),
  })
  .superRefine((data, ctx) => {
    const hasCurrent = Boolean(data.currentPassword);
    const hasNew = Boolean(data.newPassword);

    if (hasCurrent !== hasNew) {
      ctx.addIssue({
        code: 'custom',
        message: 'Current password and new password must both be provided to change password',
        path: ['newPassword'],
      });
    }
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
