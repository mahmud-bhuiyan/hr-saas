import { z } from 'zod';

const tenantUserRoleSchema = z.enum(['company_admin', 'hr_manager', 'manager', 'employee']);

export const patchTenantUserSchema = z
  .object({
    role: tenantUserRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type PatchTenantUserInput = z.infer<typeof patchTenantUserSchema>;
