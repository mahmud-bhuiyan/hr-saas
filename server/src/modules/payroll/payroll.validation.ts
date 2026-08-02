import { z } from 'zod';

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createPayrollPeriodSchema = z
  .object({
    periodStart: dateOnlySchema,
    periodEnd: dateOnlySchema,
  })
  .refine(
    (data) => data.periodStart <= data.periodEnd,
    { message: 'periodStart must be on or before periodEnd', path: ['periodEnd'] }
  );

export type CreatePayrollPeriodInput = z.infer<typeof createPayrollPeriodSchema>;
