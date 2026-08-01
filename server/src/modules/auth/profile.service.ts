import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
import { findUserByEmail } from '../admin/admin.service.js';
import { User, type IUserDocument } from '../admin/user.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken } from '../../utils/jwt.js';
import { AuthServiceError } from './auth.service.js';
import { Tenant } from './tenant.model.js';
import type { UpdateProfileInput } from './profile.validation.js';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileResult {
  user: UserProfile;
  accessToken?: string;
}

async function toUserProfile(user: IUserDocument): Promise<UserProfile> {
  let companyName: string | undefined;

  if (user.tenantId) {
    const tenant = await Tenant.findById(user.tenantId).select('name');
    companyName = tenant?.name;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId?.toString(),
    companyName,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return null;
  }
  return toUserProfile(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  env: ServerEnv
): Promise<UpdateProfileResult> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new AuthServiceError('User not found or inactive', 404);
  }

  const previousEmail = user.email;

  if (input.email && input.email !== user.email) {
    const existing = await findUserByEmail(input.email);
    if (existing && existing._id.toString() !== userId) {
      throw new AuthServiceError('Email already in use', 409);
    }
    user.email = input.email;
  }

  if (input.firstName !== undefined) {
    user.firstName = input.firstName || undefined;
  }

  if (input.lastName !== undefined) {
    user.lastName = input.lastName || undefined;
  }

  if (input.currentPassword && input.newPassword) {
    const valid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AuthServiceError('Current password is incorrect', 400);
    }
    user.passwordHash = await hashPassword(input.newPassword);
  }

  await user.save();

  const profile = await toUserProfile(user);
  const result: UpdateProfileResult = { user: profile };

  if (input.email && input.email !== previousEmail) {
    result.accessToken = signAccessToken(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        tenantId: user.tenantId?.toString(),
      },
      env.adminJwtSecret
    );
  }

  return result;
}
