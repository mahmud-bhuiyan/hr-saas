import { z } from 'zod';

export const rejectRegistrationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type RejectRegistrationInput = z.infer<typeof rejectRegistrationSchema>;
