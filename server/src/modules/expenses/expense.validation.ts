import { z } from 'zod';

export const EXPENSE_CATEGORIES = ['travel', 'meals', 'equipment', 'other'] as const;

export const EXPENSE_STATUSES = ['pending', 'approved', 'declined', 'reimbursed'] as const;

export const ALLOWED_RECEIPT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_RECEIPT_FILE_SIZE = 10 * 1024 * 1024;

const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

const expenseStatusSchema = z.enum(EXPENSE_STATUSES);

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const currencySchema = z
  .string()
  .trim()
  .length(3, 'Currency must be a 3-letter ISO 4217 code')
  .transform((value) => value.toUpperCase());

const amountSchema = z.number().positive('Amount must be greater than zero').max(999999.99);

const receiptMetadataFields = {
  receiptFileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_RECEIPT_MIME_TYPES),
  fileSize: z.number().int().min(1).max(MAX_RECEIPT_FILE_SIZE),
};

export const presignExpenseSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  ...receiptMetadataFields,
});

export const createExpenseSchema = z.object({
  category: expenseCategorySchema,
  amount: amountSchema,
  currency: currencySchema.optional().default('GBP'),
  date: dateStringSchema,
  description: z.string().trim().min(1).max(1000),
  receiptFileKey: z.string().trim().min(1).max(512),
  ...receiptMetadataFields,
});

export const patchExpenseSchema = z
  .object({
    category: expenseCategorySchema.optional(),
    amount: amountSchema.optional(),
    currency: currencySchema.optional(),
    date: dateStringSchema.optional(),
    description: z.string().trim().min(1).max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const listExpensesQuerySchema = z.object({
  scope: z.enum(['own', 'approval']).optional().default('own'),
  status: expenseStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const exportExpensesQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  status: expenseStatusSchema.optional().default('approved'),
});

export const declineExpenseSchema = z.object({
  declineReason: z.string().trim().max(1000).optional(),
});

export type PresignExpenseInput = z.infer<typeof presignExpenseSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type PatchExpenseInput = z.infer<typeof patchExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type ExportExpensesQuery = z.infer<typeof exportExpensesQuerySchema>;
export type DeclineExpenseInput = z.infer<typeof declineExpenseSchema>;
