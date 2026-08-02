import { z } from 'zod';

const leaveTypeSchema = z.enum(['annual', 'sick', 'unpaid', 'planned']);
const leaveStatusSchema = z.enum(['pending', 'approved', 'declined', 'cancelled']);

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createLeaveRequestSchema = z
  .object({
    type: leaveTypeSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    halfDay: z.boolean().optional().default(false),
    reason: z.string().trim().min(1, 'Reason is required').max(500),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine((data) => !data.halfDay || data.startDate === data.endDate, {
    message: 'Half day is only valid for single-day requests',
    path: ['halfDay'],
  });

export const listLeaveRequestsQuerySchema = z.object({
  status: leaveStatusSchema.optional(),
  employeeId: z.string().min(1).optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  mine: z.enum(['true', 'false']).optional(),
});

export const declineLeaveRequestSchema = z.object({
  declineReason: z.string().trim().max(500).optional(),
});

export const leaveCalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ListLeaveRequestsQuery = z.infer<typeof listLeaveRequestsQuerySchema>;
export type DeclineLeaveRequestInput = z.infer<typeof declineLeaveRequestSchema>;
export type LeaveCalendarQuery = z.infer<typeof leaveCalendarQuerySchema>;
