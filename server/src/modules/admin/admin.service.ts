import type { UserRole } from '../../types/index.js';
import { hashPassword } from '../../utils/password.js';
import { User, type IUserDocument } from './user.model.js';
import type { CreateAdminInput } from './admin.validation.js';

export interface AdminPublic {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
}

function toAdminPublic(user: IUserDocument): AdminPublic {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function countUsers(): Promise<number> {
  return User.countDocuments();
}

export async function countSuperAdmins(): Promise<number> {
  return User.countDocuments({ role: 'super_admin' });
}

export async function hasSuperAdmin(): Promise<boolean> {
  return (await countSuperAdmins()) > 0;
}

export async function findUserByEmail(email: string): Promise<IUserDocument | null> {
  return User.findOne({ email: email.toLowerCase().trim() });
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminPublic> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AdminServiceError('Email already in use', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    email: input.email,
    passwordHash,
    role: input.role,
    tenantId: input.role === 'super_admin' ? null : undefined,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  return toAdminPublic(user);
}

export class AdminServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AdminServiceError';
  }
}
