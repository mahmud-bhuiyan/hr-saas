import mongoose from 'mongoose';
import { Tenant } from '../auth/tenant.model.js';
import { Employee } from '../employees/employee.model.js';
import { LeaveBalance } from './leave.model.js';
import {
  calculateCarryOverAmount,
  calculateProRataEntitlement,
  DEFAULT_ANNUAL_ENTITLEMENT,
  DEFAULT_MAX_CARRY_OVER_DAYS,
} from './leave.utils.js';
import type { PatchLeaveSettingsInput } from './leave-settings.validation.js';

export class LeaveSettingsServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'LeaveSettingsServiceError';
  }
}

export interface TenantLeaveSettings {
  annualEntitlement: number;
  maxCarryOverDays: number;
  multiStepApprovalEnabled: boolean;
}

export const getTenantLeaveSettings = async (tenantId: string): Promise<TenantLeaveSettings> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new LeaveSettingsServiceError('Tenant not found', 404);
  }

  return {
    annualEntitlement: tenant.annualEntitlement ?? DEFAULT_ANNUAL_ENTITLEMENT,
    maxCarryOverDays: tenant.maxCarryOverDays ?? DEFAULT_MAX_CARRY_OVER_DAYS,
    multiStepApprovalEnabled: tenant.multiStepApprovalEnabled ?? false,
  };
};

export const getLeaveSettings = async (tenantId: string): Promise<TenantLeaveSettings> =>
  getTenantLeaveSettings(tenantId);

export const patchLeaveSettings = async (
  tenantId: string,
  input: PatchLeaveSettingsInput,
  userId: string
): Promise<TenantLeaveSettings> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new LeaveSettingsServiceError('Tenant not found', 404);
  }

  if (input.annualEntitlement !== undefined) {
    tenant.annualEntitlement = input.annualEntitlement;
  }
  if (input.maxCarryOverDays !== undefined) {
    tenant.maxCarryOverDays = input.maxCarryOverDays;
  }
  if (input.multiStepApprovalEnabled !== undefined) {
    tenant.multiStepApprovalEnabled = input.multiStepApprovalEnabled;
  }

  tenant.updatedBy = new mongoose.Types.ObjectId(userId);
  await tenant.save();

  return getTenantLeaveSettings(tenantId);
};

export const ensureLeaveBalanceForYear = async (
  tenantId: string,
  employeeId: string,
  year: number
): Promise<InstanceType<typeof LeaveBalance>> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
  const settings = await getTenantLeaveSettings(tenantId);

  const existing = await LeaveBalance.findOne({
    tenantId: tenantObjectId,
    employeeId: employeeObjectId,
    year,
  });

  if (existing) {
    return existing;
  }

  const employee = await Employee.findOne({
    _id: employeeObjectId,
    tenantId: tenantObjectId,
  });

  let carriedOver = 0;
  const prevBalance = await LeaveBalance.findOne({
    tenantId: tenantObjectId,
    employeeId: employeeObjectId,
    year: year - 1,
  });

  if (prevBalance) {
    carriedOver = calculateCarryOverAmount(prevBalance, settings.maxCarryOverDays);
  }

  const entitlement = calculateProRataEntitlement(
    settings.annualEntitlement,
    employee?.startDate,
    year
  );

  return LeaveBalance.create({
    tenantId: tenantObjectId,
    employeeId: employeeObjectId,
    year,
    entitlement,
    taken: 0,
    pending: 0,
    carriedOver,
  });
};

/** Recalculate entitlement when employee start date or tenant policy changes */
export const refreshBalanceEntitlement = async (
  tenantId: string,
  employeeId: string,
  year: number
): Promise<void> => {
  const settings = await getTenantLeaveSettings(tenantId);
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  const balance = await LeaveBalance.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
    year,
  });

  if (!balance) {
    return;
  }

  balance.entitlement = calculateProRataEntitlement(
    settings.annualEntitlement,
    employee?.startDate,
    year
  );
  await balance.save();
};

export const processCarryOverForTenant = async (
  tenantId: string,
  targetYear: number
): Promise<number> => {
  const settings = await getTenantLeaveSettings(tenantId);
  const employees = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: { $ne: 'terminated' },
  }).select('_id startDate');

  let processed = 0;

  for (const employee of employees) {
    const employeeId = employee._id.toString();
    const existing = await LeaveBalance.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      employeeId: employee._id,
      year: targetYear,
    });

    if (existing) {
      continue;
    }

    await ensureLeaveBalanceForYear(tenantId, employeeId, targetYear);
    processed += 1;
  }

  void settings;
  return processed;
};

export const processCarryOverAllTenants = async (targetYear: number): Promise<void> => {
  const tenants = await Tenant.find({ approvalStatus: 'approved', isActive: true }).select('_id');

  for (const tenant of tenants) {
    await processCarryOverForTenant(tenant._id.toString(), targetYear);
  }
};
