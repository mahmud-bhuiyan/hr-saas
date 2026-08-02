import { z } from 'zod';

export const patchLeaveSettingsSchema = z
  .object({
    annualEntitlement: z.number().min(0).max(365).optional(),
    maxCarryOverDays: z.number().min(0).max(365).optional(),
    multiStepApprovalEnabled: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.annualEntitlement !== undefined ||
      data.maxCarryOverDays !== undefined ||
      data.multiStepApprovalEnabled !== undefined,
    { message: 'At least one field must be provided' }
  );

export type PatchLeaveSettingsInput = z.infer<typeof patchLeaveSettingsSchema>;
