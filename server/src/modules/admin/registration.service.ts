import mongoose from 'mongoose';
import type { TenantApprovalStatus } from '../auth/tenant.model.js';
import { Tenant } from '../auth/tenant.model.js';
import { getTenantBillingSummaries } from '../billing/billing.service.js';
import { hashPassword } from '../../utils/password.js';
import { ensureEmployeeRecordForUser } from '../employees/employee.service.js';
import { writeAuditLog } from '../audit/audit.service.js';
import {
  normalizeEnabledModules,
  resolveEnabledModules,
  type TenantModuleId,
} from '../../types/modules.js';
import { findUserByEmail } from './admin.service.js';
import { User } from './user.model.js';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateTenantModulesInput,
} from './registration.validation.js';

export interface RegistrationRequest {
  tenantId: string;
  companyName: string;
  adminEmail: string;
  adminFirstName?: string;
  adminLastName?: string;
  status: TenantApprovalStatus;
  isActive: boolean;
  submittedAt: string;
  rejectedReason?: string;
  createdByName?: string;
  updatedByName?: string;
  updatedAt?: string;
  billingExempt?: boolean;
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'exempt' | 'none';
  seatCount?: number;
  enabledModules?: TenantModuleId[];
}

export interface TenantModulesResult {
  tenantId: string;
  enabledModules: TenantModuleId[];
}

interface UserSummary {
  email: string;
  firstName?: string;
  lastName?: string;
}

const userDisplayName = (user: UserSummary | null | undefined): string | undefined => {
  if (!user) {
    return undefined;
  }

  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return user.email;
}

const toRegistrationRequest = (
  tenant: {
    _id: mongoose.Types.ObjectId;
    name: string;
    isActive: boolean;
    approvalStatus: TenantApprovalStatus;
    rejectedReason?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    enabledModules?: string[];
  },
  admin: UserSummary | null,
  auditUsers: Map<string, UserSummary>
): RegistrationRequest => {
  const createdBy = tenant.createdBy ? auditUsers.get(tenant.createdBy.toString()) : undefined;
  const updatedBy = tenant.updatedBy ? auditUsers.get(tenant.updatedBy.toString()) : undefined;

  return {
    tenantId: tenant._id.toString(),
    companyName: tenant.name,
    adminEmail: admin?.email ?? 'unknown',
    adminFirstName: admin?.firstName,
    adminLastName: admin?.lastName,
    status: tenant.approvalStatus,
    isActive: tenant.isActive,
    submittedAt: tenant.createdAt.toISOString(),
    rejectedReason: tenant.rejectedReason,
    createdByName: userDisplayName(createdBy),
    updatedByName: userDisplayName(updatedBy),
    updatedAt: tenant.updatedAt.toISOString(),
    enabledModules: resolveEnabledModules(tenant.enabledModules),
  };
}

const loadAuditUsers = async (
  tenants: Array<{
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
  }>
): Promise<Map<string, UserSummary>> => {
  const userIds = new Set<string>();

  for (const tenant of tenants) {
    if (tenant.createdBy) {
      userIds.add(tenant.createdBy.toString());
    }
    if (tenant.updatedBy) {
      userIds.add(tenant.updatedBy.toString());
    }
  }

  if (userIds.size === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: [...userIds] } })
    .select('email firstName lastName')
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    ])
  );
}

export const createCompany = async (
  input: CreateCompanyInput,
  createdByUserId: string
): Promise<RegistrationRequest> => {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new RegistrationServiceError('Email already in use', 409);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const actorId = new mongoose.Types.ObjectId(createdByUserId);

    const [tenant] = await Tenant.create(
      [
        {
          name: input.companyName,
          isActive: true,
          approvalStatus: 'approved' as const,
          approvedAt: new Date(),
          approvedBy: actorId,
          createdBy: actorId,
          updatedBy: actorId,
          ...(input.enabledModules
            ? { enabledModules: normalizeEnabledModules(input.enabledModules) }
            : {}),
        },
      ],
      { session }
    );

    const passwordHash = await hashPassword(input.password);

    const [admin] = await User.create(
      [
        {
          email: input.email,
          passwordHash,
          role: 'company_admin' as const,
          tenantId: tenant._id,
          firstName: input.firstName,
          lastName: input.lastName,
          isActive: true,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await ensureEmployeeRecordForUser(
      tenant._id.toString(),
      {
        userId: admin._id.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      { createdByUserId: createdByUserId }
    );

    const actor = await User.findById(createdByUserId).select('email firstName lastName').lean();
    const auditUsers = new Map<string, UserSummary>();
    if (actor) {
      auditUsers.set(actor._id.toString(), {
        email: actor.email,
        firstName: actor.firstName,
        lastName: actor.lastName,
      });
    }

    return toRegistrationRequest(tenant, admin, auditUsers);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const listRegistrationRequests = async (
  status?: TenantApprovalStatus
): Promise<RegistrationRequest[]> => {
  const filter = status
    ? { approvalStatus: status }
    : { approvalStatus: { $ne: 'approved' as const } };

  const tenants = await Tenant.find(filter).sort({ createdAt: -1 }).lean();
  const auditUsers = await loadAuditUsers(tenants);

  const results: RegistrationRequest[] = [];

  for (const tenant of tenants) {
    const admin = await User.findOne({
      tenantId: tenant._id,
      role: 'company_admin',
    })
      .select('email firstName lastName')
      .lean();

    results.push(
      toRegistrationRequest(
        {
          _id: tenant._id,
          name: tenant.name,
          isActive: tenant.isActive,
          approvalStatus: tenant.approvalStatus,
          rejectedReason: tenant.rejectedReason,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
          createdBy: tenant.createdBy,
          updatedBy: tenant.updatedBy,
          enabledModules: tenant.enabledModules,
        },
        admin
          ? {
              email: admin.email,
              firstName: admin.firstName,
              lastName: admin.lastName,
            }
          : null,
        auditUsers
      )
    );
  }

  if (status === 'approved' && results.length > 0) {
    const billingSummaries = await getTenantBillingSummaries(
      results.map((row) => row.tenantId)
    );

    return results.map((row) => {
      const billing = billingSummaries.get(row.tenantId);
      if (!billing) {
        return row;
      }

      return {
        ...row,
        billingExempt: billing.billingExempt,
        subscriptionStatus: billing.subscriptionStatus,
        seatCount: billing.seatCount,
      };
    });
  }

  return results;
}

export const approveRegistration = async (
  tenantId: string,
  approvedByUserId: string
): Promise<RegistrationRequest> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new RegistrationServiceError('Registration not found', 404);
  }

  if (tenant.approvalStatus !== 'pending') {
    throw new RegistrationServiceError(
      `Registration is already ${tenant.approvalStatus}`,
      409
    );
  }

  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });
  if (!admin) {
    throw new RegistrationServiceError('Company admin user not found', 404);
  }

  const actorId = new mongoose.Types.ObjectId(approvedByUserId);

  tenant.approvalStatus = 'approved';
  tenant.isActive = true;
  tenant.approvedAt = new Date();
  tenant.approvedBy = actorId;
  tenant.updatedBy = actorId;
  tenant.rejectedReason = undefined;
  await tenant.save();

  admin.isActive = true;
  await admin.save();

  await ensureEmployeeRecordForUser(
    tenant._id.toString(),
    {
      userId: admin._id.toString(),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    },
    { createdByUserId: approvedByUserId }
  );

  const auditUsers = await loadAuditUsers([tenant]);

  return toRegistrationRequest(
    tenant,
    admin,
    auditUsers
  );
}

export const rejectRegistration = async (
  tenantId: string,
  rejectedByUserId: string,
  reason?: string
): Promise<RegistrationRequest> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new RegistrationServiceError('Registration not found', 404);
  }

  if (tenant.approvalStatus !== 'pending') {
    throw new RegistrationServiceError(
      `Registration is already ${tenant.approvalStatus}`,
      409
    );
  }

  tenant.approvalStatus = 'rejected';
  tenant.isActive = false;
  tenant.rejectedReason = reason ?? 'Registration rejected by super admin';
  tenant.updatedBy = new mongoose.Types.ObjectId(rejectedByUserId);
  await tenant.save();

  await User.updateMany({ tenantId: tenant._id }, { isActive: false });

  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });
  const auditUsers = await loadAuditUsers([tenant]);

  return toRegistrationRequest(tenant, admin, auditUsers);
}

const findApprovedTenant = async (tenantId: string) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new RegistrationServiceError('Company not found', 404);
  }

  if (tenant.approvalStatus !== 'approved') {
    throw new RegistrationServiceError('Only approved companies can be managed here', 409);
  }

  return tenant;
}

export const updateCompany = async (
  tenantId: string,
  input: UpdateCompanyInput,
  updatedByUserId: string
): Promise<RegistrationRequest> => {
  const tenant = await findApprovedTenant(tenantId);
  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });

  if (!admin) {
    throw new RegistrationServiceError('Company admin user not found', 404);
  }

  if (input.adminEmail && input.adminEmail !== admin.email) {
    const existing = await findUserByEmail(input.adminEmail);
    if (existing && existing._id.toString() !== admin._id.toString()) {
      throw new RegistrationServiceError('Email already in use', 409);
    }
    admin.email = input.adminEmail;
  }

  if (input.companyName !== undefined) {
    tenant.name = input.companyName;
  }

  if (input.adminFirstName !== undefined) {
    admin.firstName = input.adminFirstName || undefined;
  }

  if (input.adminLastName !== undefined) {
    admin.lastName = input.adminLastName || undefined;
  }

  tenant.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);
  await tenant.save();
  await admin.save();

  const auditUsers = await loadAuditUsers([tenant]);
  return toRegistrationRequest(tenant, admin, auditUsers);
}

export const deactivateCompany = async (
  tenantId: string,
  updatedByUserId: string
): Promise<RegistrationRequest> => {
  const tenant = await findApprovedTenant(tenantId);

  if (!tenant.isActive) {
    throw new RegistrationServiceError('Company is already inactive', 409);
  }

  tenant.isActive = false;
  tenant.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);
  await tenant.save();
  await User.updateMany({ tenantId: tenant._id }, { isActive: false });

  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });
  const auditUsers = await loadAuditUsers([tenant]);
  return toRegistrationRequest(tenant, admin, auditUsers);
}

export const activateCompany = async (
  tenantId: string,
  updatedByUserId: string
): Promise<RegistrationRequest> => {
  const tenant = await findApprovedTenant(tenantId);

  if (tenant.isActive) {
    throw new RegistrationServiceError('Company is already active', 409);
  }

  tenant.isActive = true;
  tenant.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);
  await tenant.save();
  await User.updateMany({ tenantId: tenant._id }, { isActive: true });

  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });
  const auditUsers = await loadAuditUsers([tenant]);
  return toRegistrationRequest(tenant, admin, auditUsers);
}

export const getTenantModules = async (tenantId: string): Promise<TenantModulesResult> => {
  const tenant = await findApprovedTenant(tenantId);

  return {
    tenantId: tenant._id.toString(),
    enabledModules: resolveEnabledModules(tenant.enabledModules),
  };
}

export const updateTenantModules = async (
  tenantId: string,
  input: UpdateTenantModulesInput,
  updatedByUserId: string
): Promise<TenantModulesResult> => {
  const tenant = await findApprovedTenant(tenantId);
  const beforeModules = resolveEnabledModules(tenant.enabledModules);
  const nextModules = normalizeEnabledModules(input.enabledModules);

  tenant.enabledModules = nextModules;
  tenant.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);
  await tenant.save();

  await writeAuditLog({
    tenantId: tenant._id.toString(),
    userId: updatedByUserId,
    action: 'update',
    entityType: 'Tenant',
    entityId: tenant._id.toString(),
    before: { enabledModules: beforeModules },
    after: { enabledModules: nextModules },
  });

  return {
    tenantId: tenant._id.toString(),
    enabledModules: nextModules,
  };
}

export class RegistrationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'RegistrationServiceError';
  }
}
