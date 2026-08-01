import { z } from 'zod';

const employeeStatusSchema = z.enum(['active', 'on_leave', 'terminated']);

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').transform((v) => v.toLowerCase().trim()).optional(),
  phone: z.string().trim().max(30).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
    .optional(),
  managerId: z.string().min(1).optional(),
  employeeNumber: z.string().trim().max(50).optional(),
  status: employeeStatusSchema.optional(),
});

export const updateEmployeeSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    email: z
      .string()
      .email('Invalid email')
      .transform((v) => v.toLowerCase().trim())
      .optional()
      .or(z.literal('')),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    jobTitle: z.string().trim().max(100).optional().or(z.literal('')),
    department: z.string().trim().max(100).optional().or(z.literal('')),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    managerId: z.string().min(1).optional().nullable(),
    status: employeeStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listEmployeesQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: employeeStatusSchema.optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
