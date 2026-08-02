import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  address: z.string().trim().max(200).optional(),
  timezone: z.string().trim().max(64).optional(),
});

export const patchLocationSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    address: z.string().trim().max(200).optional().or(z.literal('')),
    timezone: z.string().trim().max(64).optional().or(z.literal('')),
    isArchived: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type PatchLocationInput = z.infer<typeof patchLocationSchema>;
