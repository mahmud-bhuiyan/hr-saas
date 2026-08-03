import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { ColorScheme, ThemeColor, UserRole } from '../../types/index.js';
import { resolveEnabledModules, type TenantModuleId } from '../../types/modules.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  type JwtPayload,
} from '../../utils/jwt.js';
import { findUserByEmail } from '../admin/admin.service.js';
import { User, type IUserDocument } from '../admin/user.model.js';
import { Tenant } from './tenant.model.js';
import type { LoginInput, RegisterInput } from './auth.validation.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  colorScheme?: ColorScheme;
  themeColor?: ThemeColor;
  enabledModules?: TenantModuleId[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterPendingResult {
  tenantId: string;
  companyName: string;
  email: string;
  status: 'pending';
  message: string;
}

const toAuthUser = async (user: IUserDocument): Promise<AuthUser> => {
  let enabledModules: TenantModuleId[] | undefined;

  if (user.tenantId) {
    const tenant = await Tenant.findById(user.tenantId).select('enabledModules').lean();
    enabledModules = resolveEnabledModules(tenant?.enabledModules);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    colorScheme: user.colorScheme ?? 'light',
    themeColor: user.themeColor ?? 'green',
    enabledModules,
  };
}

const buildJwtPayload = (user: IUserDocument): JwtPayload => {
  return {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId?.toString(),
  };
}

const issueTokens = (user: IUserDocument, env: ServerEnv): AuthTokens => {
  const payload = buildJwtPayload(user);
  return {
    accessToken: signAccessToken(payload, env.adminJwtSecret),
    refreshToken: signRefreshToken(payload, env.adminJwtSecret),
  };
}

const assertUserCanAuthenticate = async (user: IUserDocument): Promise<void> => {
  if (user.role === 'super_admin') {
    if (!user.isActive) {
      throw new AuthServiceError('Account is inactive', 403);
    }
    return;
  }

  if (!user.tenantId) {
    throw new AuthServiceError('Account is inactive', 403);
  }

  const tenant = await Tenant.findById(user.tenantId);
  if (!tenant) {
    throw new AuthServiceError('Company account not found', 403);
  }

  const approvalStatus =
    tenant.approvalStatus ?? (tenant.isActive ? 'approved' : 'pending');

  if (approvalStatus === 'pending') {
    throw new AuthServiceError(
      'Your company registration is pending super admin approval',
      403
    );
  }

  if (approvalStatus === 'rejected') {
    throw new AuthServiceError(
      tenant.rejectedReason ?? 'Your company registration was rejected',
      403
    );
  }

  if (!user.isActive || !tenant.isActive || approvalStatus !== 'approved') {
    throw new AuthServiceError('Company account is not active', 403);
  }
}

export const registerCompany = async (input: RegisterInput): Promise<RegisterPendingResult> => {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AuthServiceError('Email already in use', 409);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [tenant] = await Tenant.create(
      [
        {
          name: input.companyName,
          isActive: false,
          approvalStatus: 'pending' as const,
        },
      ],
      { session }
    );

    const passwordHash = await hashPassword(input.password);

    const [user] = await User.create(
      [
        {
          email: input.email,
          passwordHash,
          role: 'company_admin' as const,
          tenantId: tenant._id,
          firstName: input.firstName,
          lastName: input.lastName,
          isActive: false,
        },
      ],
      { session }
    );

    tenant.createdBy = user._id;
    tenant.updatedBy = user._id;
    await tenant.save({ session });

    await session.commitTransaction();

    return {
      tenantId: tenant._id.toString(),
      companyName: tenant.name,
      email: user.email,
      status: 'pending',
      message:
        'Registration submitted. A super admin must approve your company before you can sign in.',
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const loginUser = async (input: LoginInput, env: ServerEnv): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  await assertUserCanAuthenticate(user);

  return {
    user: await toAuthUser(user),
    tokens: issueTokens(user, env),
  };
}

export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  try {
    await assertUserCanAuthenticate(user);
  } catch {
    return null;
  }

  return await toAuthUser(user);
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}
