import { z } from 'zod';

export const patchCompanyProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Company name is required').max(200).optional(),
    address: z.string().trim().max(500).optional(),
    logoUrl: z.union([z.string().url('Logo must be a valid URL'), z.literal(''), z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type PatchCompanyProfileInput = z.infer<typeof patchCompanyProfileSchema>;
