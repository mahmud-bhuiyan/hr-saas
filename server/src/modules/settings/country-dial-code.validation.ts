import { z } from "zod";
import {
  DEFAULT_MAX_NATIONAL_LENGTH,
  DEFAULT_MIN_NATIONAL_LENGTH,
  E164_MAX_TOTAL_DIGITS,
} from "../../constants/phone.js";
import { getE164MaxNationalLength } from "../../utils/phone.js";

const isoCountryCodeSchema = z
  .string()
  .trim()
  .length(2, "Country code must be 2 letters")
  .transform((value) => value.toUpperCase());

const dialCodeSchema = z
  .string()
  .trim()
  .min(1, "Dial code is required")
  .max(4, "Dial code is too long")
  .regex(/^\d+$/, "Dial code must contain digits only");

const nationalLengthSchema = z
  .number()
  .int("Length must be a whole number")
  .min(1, "Length must be at least 1")
  .max(E164_MAX_TOTAL_DIGITS, `Length cannot exceed ${E164_MAX_TOTAL_DIGITS}`);

const withNationalLengthRules = <
  T extends {
    dialCode: string;
    minNationalLength: number;
    maxNationalLength: number;
  },
>(
  schema: z.ZodType<T>,
) =>
  schema
    .refine((data) => data.minNationalLength <= data.maxNationalLength, {
      message: "Minimum length cannot exceed maximum length",
      path: ["maxNationalLength"],
    })
    .refine(
      (data) =>
        data.maxNationalLength <= getE164MaxNationalLength(data.dialCode),
      {
        message: "Maximum length is too long for this dial code (E.164 limit)",
        path: ["maxNationalLength"],
      },
    );

export const createCountryDialCodeSchema = withNationalLengthRules(
  z.object({
    code: isoCountryCodeSchema,
    name: z.string().trim().min(1, "Country name is required").max(100),
    dialCode: dialCodeSchema,
    minNationalLength: nationalLengthSchema.default(
      DEFAULT_MIN_NATIONAL_LENGTH,
    ),
    maxNationalLength: nationalLengthSchema.default(
      DEFAULT_MAX_NATIONAL_LENGTH,
    ),
  }),
);

export const patchCountryDialCodeSchema = z
  .object({
    code: isoCountryCodeSchema.optional(),
    name: z
      .string()
      .trim()
      .min(1, "Country name is required")
      .max(100)
      .optional(),
    dialCode: dialCodeSchema.optional(),
    minNationalLength: nationalLengthSchema.optional(),
    maxNationalLength: nationalLengthSchema.optional(),
    isArchived: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .superRefine((data, ctx) => {
    if (
      data.minNationalLength !== undefined &&
      data.maxNationalLength !== undefined &&
      data.minNationalLength > data.maxNationalLength
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum length cannot exceed maximum length",
        path: ["maxNationalLength"],
      });
    }

    if (data.dialCode && data.maxNationalLength !== undefined) {
      const e164Max = getE164MaxNationalLength(data.dialCode);
      if (data.maxNationalLength > e164Max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Maximum length is too long for this dial code (E.164 limit)",
          path: ["maxNationalLength"],
        });
      }
    }
  });

export type CreateCountryDialCodeInput = z.infer<
  typeof createCountryDialCodeSchema
>;
export type PatchCountryDialCodeInput = z.infer<
  typeof patchCountryDialCodeSchema
>;
