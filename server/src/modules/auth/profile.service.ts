import type { ServerEnv } from '../../config/env.js';
import type { ColorScheme, ThemeColor, UserRole } from '../../types/index.js';
import { resolveEnabledModules, type TenantModuleId } from '../../types/modules.js';
import { findUserByEmail } from '../admin/admin.service.js';
import { User, type IUserDocument } from '../admin/user.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken } from '../../utils/jwt.js';
import { ImgbbServiceError, uploadAvatarToImgbb } from '../platform/imgbb.service.js';
import { stripDataUrlPrefix } from '../platform/platform-settings.validation.js';
import { AuthServiceError } from './auth.service.js';
import { Tenant } from './tenant.model.js';
import type { UpdateProfileInput, UploadAvatarInput } from './profile.validation.js';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  tenantId?: string;
  companyName?: string;
  colorScheme: ColorScheme;
  themeColor: ThemeColor;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enabledModules?: TenantModuleId[];
}

export interface UpdateProfileResult {
  user: UserProfile;
  accessToken?: string;
}

const toUserProfile = async (user: IUserDocument): Promise<UserProfile> => {
  let companyName: string | undefined;
  let enabledModules: TenantModuleId[] | undefined;

  if (user.tenantId) {
    const tenant = await Tenant.findById(user.tenantId).select('name enabledModules').lean();
    companyName = tenant?.name;
    enabledModules = resolveEnabledModules(tenant?.enabledModules);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    tenantId: user.tenantId?.toString(),
    companyName,
    colorScheme: user.colorScheme ?? 'light',
    themeColor: user.themeColor ?? 'green',
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    enabledModules,
  };
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return null;
  }
  return toUserProfile(user);
}

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
  env: ServerEnv
): Promise<UpdateProfileResult> => {
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

  if (input.avatarUrl !== undefined) {
    user.avatarUrl = input.avatarUrl || undefined;
  }

  if (input.colorScheme !== undefined) {
    user.colorScheme = input.colorScheme;
  }

  if (input.themeColor !== undefined) {
    user.themeColor = input.themeColor;
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

export const uploadProfileAvatar = async (
  userId: string,
  input: UploadAvatarInput,
  env: ServerEnv
): Promise<UpdateProfileResult> => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AuthServiceError('User not found or inactive', 404);
  }

  const base64 = stripDataUrlPrefix(input.imageBase64.trim());
  let avatarUrl: string;

  try {
    avatarUrl = await uploadAvatarToImgbb(env, base64, input.filename);
  } catch (error) {
    if (error instanceof ImgbbServiceError) {
      throw new AuthServiceError(error.message, error.statusCode);
    }
    throw error;
  }

  user.avatarUrl = avatarUrl;
  await user.save();

  return { user: await toUserProfile(user) };
}
