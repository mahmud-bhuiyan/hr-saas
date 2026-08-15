import mongoose from "mongoose";
import {
  DEFAULT_MAX_NATIONAL_LENGTH,
  DEFAULT_MIN_NATIONAL_LENGTH,
} from "../../constants/phone.js";
import { COUNTRY_DIAL_CODE_SEED } from "../../constants/country-dial-codes.seed.js";
import { getE164MaxNationalLength } from "../../utils/phone.js";
import { Tenant } from "../auth/tenant.model.js";
import {
  CountryDialCode,
  type ICountryDialCodeDocument,
} from "./country-dial-code.model.js";
import type {
  CreateCountryDialCodeInput,
  PatchCountryDialCodeInput,
} from "./country-dial-code.validation.js";

export class CountryDialCodeServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "CountryDialCodeServiceError";
  }
}

export interface CountryDialCodePublic {
  id: string;
  code: string;
  name: string;
  dialCode: string;
  minNationalLength: number;
  maxNationalLength: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CountryDialCodesBundle {
  countryDialCodes: CountryDialCodePublic[];
  defaultPhoneDialCode: string;
}

const toCountryDialCodePublic = (
  countryDialCode: ICountryDialCodeDocument,
): CountryDialCodePublic => ({
  id: countryDialCode._id.toString(),
  code: countryDialCode.code,
  name: countryDialCode.name,
  dialCode: countryDialCode.dialCode,
  minNationalLength: countryDialCode.minNationalLength,
  maxNationalLength: countryDialCode.maxNationalLength,
  isArchived: countryDialCode.isArchived,
  createdAt: countryDialCode.createdAt.toISOString(),
  updatedAt: countryDialCode.updatedAt.toISOString(),
});

const getTenantDefaultDialCode = async (tenantId: string): Promise<string> => {
  const tenant = await Tenant.findById(tenantId).select("defaultPhoneDialCode");
  return tenant?.defaultPhoneDialCode ?? "1";
};

const seedCountryDialCodes = async (userId?: string): Promise<void> => {
  const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : undefined;

  await CountryDialCode.insertMany(
    COUNTRY_DIAL_CODE_SEED.map((entry) => ({
      code: entry.code,
      name: entry.name,
      dialCode: entry.dialCode,
      minNationalLength: entry.minNationalLength ?? DEFAULT_MIN_NATIONAL_LENGTH,
      maxNationalLength: entry.maxNationalLength ?? DEFAULT_MAX_NATIONAL_LENGTH,
      isArchived: false,
      createdBy: userObjectId,
      updatedBy: userObjectId,
    })),
  );
};

const backfillCountryDialCodeLengths = async (): Promise<void> => {
  await CountryDialCode.updateMany(
    { minNationalLength: { $exists: false } },
    {
      $set: {
        minNationalLength: DEFAULT_MIN_NATIONAL_LENGTH,
        maxNationalLength: DEFAULT_MAX_NATIONAL_LENGTH,
      },
    },
  );
};

export const ensureCountryDialCodesSeeded = async (
  userId?: string,
): Promise<void> => {
  const count = await CountryDialCode.countDocuments();

  if (count === 0) {
    await seedCountryDialCodes(userId);
  }

  await backfillCountryDialCodeLengths();
};

export const listCountryDialCodes = async (
  includeArchived = false,
  userId?: string,
): Promise<CountryDialCodePublic[]> => {
  await ensureCountryDialCodesSeeded(userId);

  const filter: Record<string, unknown> = {};
  if (!includeArchived) {
    filter.isArchived = false;
  }

  const countryDialCodes = await CountryDialCode.find(filter).sort({ name: 1 });
  return countryDialCodes.map(toCountryDialCodePublic);
};

export const getCountryDialCodesBundle = async (
  tenantId: string,
  userId?: string,
): Promise<CountryDialCodesBundle> => {
  const countryDialCodes = await listCountryDialCodes(false, userId);
  const defaultPhoneDialCode = await getTenantDefaultDialCode(tenantId);

  return {
    countryDialCodes,
    defaultPhoneDialCode,
  };
};

export const assertActiveDialCodeExists = async (
  dialCode: string,
): Promise<void> => {
  await ensureCountryDialCodesSeeded();

  const activeDialCode = await CountryDialCode.findOne({
    dialCode,
    isArchived: false,
  });

  if (!activeDialCode) {
    throw new CountryDialCodeServiceError(
      "Default dial code must match an active country in the platform list",
      400,
    );
  }
};

export const createCountryDialCode = async (
  input: CreateCountryDialCodeInput,
  userId: string,
): Promise<CountryDialCodePublic> => {
  await ensureCountryDialCodesSeeded(userId);

  const existing = await CountryDialCode.findOne({ code: input.code });

  if (existing) {
    if (existing.isArchived) {
      existing.name = input.name.trim();
      existing.dialCode = input.dialCode.trim();
      existing.minNationalLength = input.minNationalLength;
      existing.maxNationalLength = input.maxNationalLength;
      existing.isArchived = false;
      existing.updatedBy = new mongoose.Types.ObjectId(userId);
      await existing.save();
      return toCountryDialCodePublic(existing);
    }

    throw new CountryDialCodeServiceError(
      "A country with this code already exists",
      409,
    );
  }

  const countryDialCode = await CountryDialCode.create({
    code: input.code,
    name: input.name.trim(),
    dialCode: input.dialCode.trim(),
    minNationalLength: input.minNationalLength,
    maxNationalLength: input.maxNationalLength,
    isArchived: false,
    createdBy: new mongoose.Types.ObjectId(userId),
    updatedBy: new mongoose.Types.ObjectId(userId),
  });

  return toCountryDialCodePublic(countryDialCode);
};

export const patchCountryDialCode = async (
  countryDialCodeId: string,
  input: PatchCountryDialCodeInput,
  userId: string,
): Promise<CountryDialCodePublic> => {
  const countryDialCode = await CountryDialCode.findById(countryDialCodeId);

  if (!countryDialCode) {
    throw new CountryDialCodeServiceError("Country dial code not found", 404);
  }

  if (input.code !== undefined && input.code !== countryDialCode.code) {
    const duplicate = await CountryDialCode.findOne({
      _id: { $ne: countryDialCode._id },
      code: input.code,
    });

    if (duplicate) {
      throw new CountryDialCodeServiceError(
        "A country with this code already exists",
        409,
      );
    }

    countryDialCode.code = input.code;
  }

  if (input.name !== undefined) {
    countryDialCode.name = input.name.trim();
  }

  if (input.dialCode !== undefined) {
    countryDialCode.dialCode = input.dialCode.trim();
  }

  if (input.minNationalLength !== undefined) {
    countryDialCode.minNationalLength = input.minNationalLength;
  }

  if (input.maxNationalLength !== undefined) {
    countryDialCode.maxNationalLength = input.maxNationalLength;
  }

  const nextDialCode = countryDialCode.dialCode;
  const nextMin = countryDialCode.minNationalLength;
  const nextMax = countryDialCode.maxNationalLength;

  if (nextMin > nextMax) {
    throw new CountryDialCodeServiceError(
      "Minimum length cannot exceed maximum length",
      400,
    );
  }

  if (nextMax > getE164MaxNationalLength(nextDialCode)) {
    throw new CountryDialCodeServiceError(
      "Maximum length is too long for this dial code (E.164 limit)",
      400,
    );
  }

  if (input.isArchived !== undefined) {
    countryDialCode.isArchived = input.isArchived;
  }

  countryDialCode.updatedBy = new mongoose.Types.ObjectId(userId);
  await countryDialCode.save();

  return toCountryDialCodePublic(countryDialCode);
};
