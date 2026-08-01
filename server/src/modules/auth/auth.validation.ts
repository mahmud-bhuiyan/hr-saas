import { z } from 'zod';

export const registerSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
