import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  entityType: z.enum(['Employee', 'HrDocument', 'User', 'LeaveRequest']).optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
