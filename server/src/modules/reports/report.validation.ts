import { z } from 'zod';

export const headcountQuerySchema = z.object({
  department: z.string().trim().optional(),
});

export const absenceSummaryQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD'),
  department: z.string().trim().optional(),
});

export type HeadcountQuery = z.infer<typeof headcountQuerySchema>;
export type AbsenceSummaryQuery = z.infer<typeof absenceSummaryQuerySchema>;
