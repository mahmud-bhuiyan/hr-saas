import { z } from 'zod';

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const clockInSchema = z.object({
  location: locationSchema.optional(),
});

export const listMyAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listEmployeeAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const patchAttendanceSchema = z
  .object({
    clockIn: z.string().datetime().optional(),
    clockOut: z.string().datetime().nullable().optional(),
    notes: z.string().trim().min(1, 'Correction notes are required'),
  })
  .refine((data) => data.clockIn !== undefined || data.clockOut !== undefined, {
    message: 'At least one of clockIn or clockOut must be provided',
  });

export const patchAttendanceSettingsSchema = z.object({
  attendanceGpsEnabled: z.boolean(),
});

export const attendanceCalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type ClockInInput = z.infer<typeof clockInSchema>;
export type ListMyAttendanceQuery = z.infer<typeof listMyAttendanceQuerySchema>;
export type ListEmployeeAttendanceQuery = z.infer<typeof listEmployeeAttendanceQuerySchema>;
export type PatchAttendanceInput = z.infer<typeof patchAttendanceSchema>;
export type PatchAttendanceSettingsInput = z.infer<typeof patchAttendanceSettingsSchema>;
export type AttendanceCalendarQuery = z.infer<typeof attendanceCalendarQuerySchema>;
