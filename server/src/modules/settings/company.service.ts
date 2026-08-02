import mongoose from 'mongoose';
import { Tenant } from '../auth/tenant.model.js';
import type { PatchCompanyProfileInput } from './company.validation.js';

export class CompanySettingsServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'CompanySettingsServiceError';
  }
}

export interface CompanyProfile {
  name: string;
  address: string | null;
  logoUrl: string | null;
  updatedAt: string;
}

const normalizeUrl = (value: string | null | undefined): string | null => {
  if (value === null || value === '' || value === undefined) {
    return null;
  }
  return value;
};

const toCompanyProfile = (tenant: {
  name: string;
  address?: string;
  logoUrl?: string | null;
  updatedAt: Date;
}): CompanyProfile => ({
  name: tenant.name,
  address: tenant.address?.trim() || null,
  logoUrl: tenant.logoUrl ?? null,
  updatedAt: tenant.updatedAt.toISOString(),
});

export const getCompanyProfile = async (tenantId: string): Promise<CompanyProfile> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new CompanySettingsServiceError('Tenant not found', 404);
  }
  return toCompanyProfile(tenant);
};

export const patchCompanyProfile = async (
  tenantId: string,
  input: PatchCompanyProfileInput,
  userId: string
): Promise<CompanyProfile> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new CompanySettingsServiceError('Tenant not found', 404);
  }

  if (input.name !== undefined) {
    tenant.name = input.name;
  }
  if (input.address !== undefined) {
    tenant.address = input.address.trim() || undefined;
  }
  if (input.logoUrl !== undefined) {
    tenant.logoUrl = normalizeUrl(input.logoUrl);
  }

  tenant.updatedBy = new mongoose.Types.ObjectId(userId);
  await tenant.save();

  return toCompanyProfile(tenant);
};
