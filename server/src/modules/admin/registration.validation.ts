import { z } from 'zod';
import { ALL_TENANT_MODULE_IDS } from '../../types/modules.js';

export const createCompanySchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  enabledModules: z.array(z.enum(ALL_TENANT_MODULE_IDS)).optional(),
});

export const rejectRegistrationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const updateCompanySchema = z
  .object({
    companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').optional(),
    adminEmail: z.string().email().transform((v) => v.toLowerCase().trim()).optional(),
    adminFirstName: z.string().trim().optional(),
    adminLastName: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.companyName !== undefined ||
      data.adminEmail !== undefined ||
      data.adminFirstName !== undefined ||
      data.adminLastName !== undefined ||
      data.isActive !== undefined,
    { message: 'At least one field must be provided' }
  );

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type RejectRegistrationInput = z.infer<typeof rejectRegistrationSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const updateTenantModulesSchema = z.object({
  enabledModules: z.array(z.enum(ALL_TENANT_MODULE_IDS)),
});

export type UpdateTenantModulesInput = z.infer<typeof updateTenantModulesSchema>;
