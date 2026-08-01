import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: z.string().email().transform((v) => v.toLowerCase().trim()).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
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
