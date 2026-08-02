import mongoose from 'mongoose';
import type { UserRole } from '../../types/index.js';
import { User } from '../admin/user.model.js';
import type { PatchTenantUserInput } from './users.validation.js';

export class TenantUsersServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'TenantUsersServiceError';
  }
}

export interface TenantUserPublic {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const toTenantUserPublic = (user: {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TenantUserPublic => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const listTenantUsers = async (tenantId: string): Promise<TenantUserPublic[]> => {
  const users = await User.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $ne: 'super_admin' },
  }).sort({ email: 1 });

  return users.map(toTenantUserPublic);
};

const countActiveCompanyAdmins = async (
  tenantId: string,
  excludeUserId?: string
): Promise<number> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: 'company_admin',
    isActive: true,
  };

  if (excludeUserId) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
  }

  return User.countDocuments(filter);
};

export const patchTenantUser = async (
  tenantId: string,
  targetUserId: string,
  input: PatchTenantUserInput,
  actorUserId: string
): Promise<TenantUserPublic> => {
  if (targetUserId === actorUserId) {
    throw new TenantUsersServiceError('You cannot change your own role or status', 400);
  }

  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(targetUserId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $ne: 'super_admin' },
  });

  if (!user) {
    throw new TenantUsersServiceError('User not found', 404);
  }

  const demotingAdmin =
    user.role === 'company_admin' &&
    ((input.role !== undefined && input.role !== 'company_admin') ||
      input.isActive === false);

  if (demotingAdmin) {
    const otherAdmins = await countActiveCompanyAdmins(tenantId, targetUserId);
    if (otherAdmins === 0) {
      throw new TenantUsersServiceError(
        'Cannot change role or deactivate the last company admin',
        400
      );
    }
  }

  if (input.role !== undefined) {
    user.role = input.role;
  }
  if (input.isActive !== undefined) {
    user.isActive = input.isActive;
  }

  await user.save();
  return toTenantUserPublic(user);
};
