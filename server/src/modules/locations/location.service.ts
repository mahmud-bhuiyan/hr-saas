import mongoose from 'mongoose';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { locationAuditSnapshot } from '../../utils/audit-snapshot.js';
import { WorkLocation, type IWorkLocationDocument } from './location.model.js';
import type { CreateLocationInput, PatchLocationInput } from './location.validation.js';

export class LocationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

export interface WorkLocationPublic {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const toLocationPublic = (location: IWorkLocationDocument): WorkLocationPublic => ({
  id: location._id.toString(),
  name: location.name,
  address: location.address,
  timezone: location.timezone,
  isArchived: location.isArchived,
  createdAt: location.createdAt.toISOString(),
  updatedAt: location.updatedAt.toISOString(),
});

export const listWorkLocations = async (
  tenantId: string,
  includeArchived = false
): Promise<WorkLocationPublic[]> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (!includeArchived) {
    filter.isArchived = false;
  }

  const locations = await WorkLocation.find(filter).sort({ name: 1 });
  return locations.map(toLocationPublic);
};

export const createWorkLocation = async (
  tenantId: string,
  input: CreateLocationInput,
  userId: string,
  audit?: AuditContext
): Promise<WorkLocationPublic> => {
  const name = input.name.trim();

  const existing = await WorkLocation.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });

  if (existing) {
    if (existing.isArchived) {
      existing.isArchived = false;
      existing.address = input.address?.trim() || undefined;
      existing.timezone = input.timezone?.trim() || undefined;
      existing.updatedBy = new mongoose.Types.ObjectId(userId);
      await existing.save();

      void writeAuditLog({
        tenantId,
        userId,
        action: 'update',
        entityType: 'WorkLocation',
        entityId: existing._id.toString(),
        after: locationAuditSnapshot(existing),
        context: audit,
      });

      return toLocationPublic(existing);
    }
    throw new LocationServiceError('A location with this name already exists', 409);
  }

  const location = await WorkLocation.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    name,
    address: input.address?.trim() || undefined,
    timezone: input.timezone?.trim() || undefined,
    isArchived: false,
    createdBy: new mongoose.Types.ObjectId(userId),
    updatedBy: new mongoose.Types.ObjectId(userId),
  });

  void writeAuditLog({
    tenantId,
    userId,
    action: 'create',
    entityType: 'WorkLocation',
    entityId: location._id.toString(),
    after: locationAuditSnapshot(location),
    context: audit,
  });

  return toLocationPublic(location);
};

export const patchWorkLocation = async (
  tenantId: string,
  locationId: string,
  input: PatchLocationInput,
  userId: string,
  audit?: AuditContext
): Promise<WorkLocationPublic> => {
  const location = await WorkLocation.findOne({
    _id: new mongoose.Types.ObjectId(locationId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!location) {
    throw new LocationServiceError('Location not found', 404);
  }

  const beforeSnapshot = locationAuditSnapshot(location);

  if (input.name !== undefined && input.name.trim() !== location.name) {
    const duplicate = await WorkLocation.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      _id: { $ne: location._id },
      name: {
        $regex: new RegExp(
          `^${input.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
    });

    if (duplicate) {
      throw new LocationServiceError('A location with this name already exists', 409);
    }

    location.name = input.name.trim();
  }

  if (input.address !== undefined) {
    location.address = input.address.trim() || undefined;
  }

  if (input.timezone !== undefined) {
    location.timezone = input.timezone.trim() || undefined;
  }

  if (input.isArchived !== undefined) {
    location.isArchived = input.isArchived;
  }

  location.updatedBy = new mongoose.Types.ObjectId(userId);
  await location.save();

  void writeAuditLog({
    tenantId,
    userId,
    action: 'update',
    entityType: 'WorkLocation',
    entityId: location._id.toString(),
    before: beforeSnapshot,
    after: locationAuditSnapshot(location),
    context: audit,
  });

  return toLocationPublic(location);
};

export const assertActiveWorkLocation = async (
  tenantId: string,
  locationId: string | null | undefined
): Promise<void> => {
  if (!locationId) {
    return;
  }

  const location = await WorkLocation.findOne({
    _id: new mongoose.Types.ObjectId(locationId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    isArchived: false,
  });

  if (!location) {
    throw new LocationServiceError('Work location not found or archived', 400);
  }
};
