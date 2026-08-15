import { z } from "zod";

const dialCodeSchema = z
  .string()
  .trim()
  .min(1, "Dial code is required")
  .max(4, "Dial code is too long")
  .regex(/^\d+$/, "Dial code must contain digits only");

export const patchCompanyProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(200)
      .optional(),
    address: z.string().trim().max(500).optional(),
    logoUrl: z
      .union([
        z.string().url("Logo must be a valid URL"),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    defaultPhoneDialCode: dialCodeSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type PatchCompanyProfileInput = z.infer<
  typeof patchCompanyProfileSchema
>;
