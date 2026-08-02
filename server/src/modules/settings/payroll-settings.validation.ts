import { z } from 'zod';

export const payPeriodTypeSchema = z.enum(['weekly', 'biweekly', 'monthly']);

export const patchPayrollSettingsSchema = z
  .object({
    payPeriodType: payPeriodTypeSchema.optional(),
    defaultPayCurrency: z.string().trim().min(3).max(3).optional(),
    payrollWeekStartDay: z.number().int().min(0).max(6).optional(),
    xeroExpenseAccountCode: z.string().trim().min(1).max(10).optional(),
    xeroPayableAccountCode: z.string().trim().min(1).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type PatchPayrollSettingsInput = z.infer<typeof patchPayrollSettingsSchema>;
