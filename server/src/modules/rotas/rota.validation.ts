import { z } from 'zod';

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be HH:mm');

const objectIdSchema = z.string().min(1);

export const createShiftSchema = z
  .object({
    employeeId: objectIdSchema.nullable().optional(),
    date: dateOnlySchema,
    startTime: timeSchema,
    endTime: timeSchema,
    role: z.string().trim().max(100).optional(),
    locationId: objectIdSchema,
    status: z.enum(['draft']).optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const patchShiftSchema = z
  .object({
    employeeId: objectIdSchema.nullable().optional(),
    date: dateOnlySchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    role: z.string().trim().max(100).optional().or(z.literal('')),
    locationId: objectIdSchema.optional(),
    status: z.enum(['draft', 'published', 'open']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const publishRotaSchema = z.object({
  weekOf: dateOnlySchema,
});

export const copyWeekSchema = z.object({
  weekOf: dateOnlySchema,
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type PatchShiftInput = z.infer<typeof patchShiftSchema>;
export type PublishRotaInput = z.infer<typeof publishRotaSchema>;
export type CopyWeekInput = z.infer<typeof copyWeekSchema>;
