import { z } from 'zod';

export const createAdminSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8),
  role: z.enum([
    'super_admin',
    'company_admin',
    'hr_manager',
    'manager',
    'employee',
  ]),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
