import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
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
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

function toAuthUser(user: IUserDocument): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

function buildJwtPayload(user: IUserDocument): JwtPayload {
  return {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId?.toString(),
  };
}

function issueTokens(user: IUserDocument, env: ServerEnv): AuthTokens {
  const payload = buildJwtPayload(user);
  return {
    accessToken: signAccessToken(payload, env.adminJwtSecret),
    refreshToken: signRefreshToken(payload, env.adminJwtSecret),
  };
}

export async function registerCompany(
  input: RegisterInput,
  env: ServerEnv
): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AuthServiceError('Email already in use', 409);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [tenant] = await Tenant.create(
      [{ name: input.companyName }],
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
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      user: toAuthUser(user),
      tokens: issueTokens(user, env),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function loginUser(input: LoginInput, env: ServerEnv): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user || !user.isActive) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  return {
    user: toAuthUser(user),
    tokens: issueTokens(user, env),
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return null;
  }
  return toAuthUser(user);
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
