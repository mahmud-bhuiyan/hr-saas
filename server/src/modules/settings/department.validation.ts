import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(100),
});

export const patchDepartmentSchema = z
  .object({
    name: z.string().trim().min(1, 'Department name is required').max(100).optional(),
    isArchived: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type PatchDepartmentInput = z.infer<typeof patchDepartmentSchema>;
