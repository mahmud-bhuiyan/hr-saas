import { z } from 'zod';

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const generateTimesheetSchema = z.object({
  weekOf: dateOnlySchema,
});

export const listMyTimesheetsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listTimesheetsQuerySchema = z.object({
  status: z.enum(['submitted', 'approved', 'declined', 'draft']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const patchTimesheetEntrySchema = z.object({
  date: dateOnlySchema,
  hours: z.number().min(0).max(24),
  notes: z.string().trim().optional(),
});

export const patchTimesheetSchema = z.object({
  entries: z.array(patchTimesheetEntrySchema).min(1),
});

export const declineTimesheetSchema = z.object({
  declineReason: z.string().trim().optional(),
});

export type GenerateTimesheetInput = z.infer<typeof generateTimesheetSchema>;
export type ListMyTimesheetsQuery = z.infer<typeof listMyTimesheetsQuerySchema>;
export type ListTimesheetsQuery = z.infer<typeof listTimesheetsQuerySchema>;
export type PatchTimesheetInput = z.infer<typeof patchTimesheetSchema>;
export type DeclineTimesheetInput = z.infer<typeof declineTimesheetSchema>;
