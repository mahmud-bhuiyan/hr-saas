import mongoose from 'mongoose';
import type { TenantApprovalStatus } from '../auth/tenant.model.js';
import { Tenant } from '../auth/tenant.model.js';
import { User } from './user.model.js';

export interface RegistrationRequest {
  tenantId: string;
  companyName: string;
  adminEmail: string;
  adminFirstName?: string;
  adminLastName?: string;
  status: TenantApprovalStatus;
  submittedAt: string;
  rejectedReason?: string;
}

function toRegistrationRequest(
  tenant: {
    _id: mongoose.Types.ObjectId;
    name: string;
    approvalStatus: TenantApprovalStatus;
    rejectedReason?: string;
    createdAt: Date;
  },
  admin: {
    email: string;
    firstName?: string;
    lastName?: string;
  } | null
): RegistrationRequest {
  return {
    tenantId: tenant._id.toString(),
    companyName: tenant.name,
    adminEmail: admin?.email ?? 'unknown',
    adminFirstName: admin?.firstName,
    adminLastName: admin?.lastName,
    status: tenant.approvalStatus,
    submittedAt: tenant.createdAt.toISOString(),
    rejectedReason: tenant.rejectedReason,
  };
}

export async function listRegistrationRequests(
  status?: TenantApprovalStatus
): Promise<RegistrationRequest[]> {
  const filter = status
    ? { approvalStatus: status }
    : { approvalStatus: { $ne: 'approved' as const } };

  const tenants = await Tenant.find(filter).sort({ createdAt: -1 }).lean();

  const results: RegistrationRequest[] = [];

  for (const tenant of tenants) {
    const admin = await User.findOne({
      tenantId: tenant._id,
      role: 'company_admin',
    }).lean();

    results.push(
      toRegistrationRequest(
        {
          _id: tenant._id,
          name: tenant.name,
          approvalStatus: tenant.approvalStatus,
          rejectedReason: tenant.rejectedReason,
          createdAt: tenant.createdAt,
        },
        admin
          ? {
              email: admin.email,
              firstName: admin.firstName,
              lastName: admin.lastName,
            }
          : null
      )
    );
  }

  return results;
}

export async function approveRegistration(
  tenantId: string,
  approvedByUserId: string
): Promise<RegistrationRequest> {
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

  tenant.approvalStatus = 'approved';
  tenant.isActive = true;
  tenant.approvedAt = new Date();
  tenant.approvedBy = new mongoose.Types.ObjectId(approvedByUserId);
  tenant.rejectedReason = undefined;
  await tenant.save();

  admin.isActive = true;
  await admin.save();

  return toRegistrationRequest(tenant, admin);
}

export async function rejectRegistration(
  tenantId: string,
  reason?: string
): Promise<RegistrationRequest> {
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
  await tenant.save();

  await User.updateMany({ tenantId: tenant._id }, { isActive: false });

  const admin = await User.findOne({ tenantId: tenant._id, role: 'company_admin' });

  return toRegistrationRequest(tenant, admin);
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
