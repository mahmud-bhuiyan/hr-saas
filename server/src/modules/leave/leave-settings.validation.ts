import { z } from "zod";

const entitlementDays = z.number().min(0).max(365);

export const patchLeaveSettingsSchema = z
  .object({
    plannedLeaveEntitlement: entitlementDays.optional(),
    unplannedLeaveEntitlement: entitlementDays.optional(),
    unpaidLeaveEntitlement: entitlementDays.optional(),
    maxCarryOverDays: entitlementDays.optional(),
    multiStepApprovalEnabled: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.plannedLeaveEntitlement !== undefined ||
      data.unplannedLeaveEntitlement !== undefined ||
      data.unpaidLeaveEntitlement !== undefined ||
      data.maxCarryOverDays !== undefined ||
      data.multiStepApprovalEnabled !== undefined,
    { message: "At least one field must be provided" },
  );

export type PatchLeaveSettingsInput = z.infer<typeof patchLeaveSettingsSchema>;
