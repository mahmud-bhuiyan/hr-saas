import mongoose from 'mongoose';
import { Tenant } from '../auth/tenant.model.js';
import type { PatchPayrollSettingsInput } from './payroll-settings.validation.js';

export class PayrollSettingsServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'PayrollSettingsServiceError';
  }
}

export type PayPeriodType = 'weekly' | 'biweekly' | 'monthly';

export interface TenantPayrollSettings {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: number;
}

export const DEFAULT_PAY_PERIOD_TYPE: PayPeriodType = 'weekly';
export const DEFAULT_PAY_CURRENCY = 'GBP';
export const DEFAULT_PAYROLL_WEEK_START_DAY = 1;

export const getPayrollSettings = async (tenantId: string): Promise<TenantPayrollSettings> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new PayrollSettingsServiceError('Tenant not found', 404);
  }

  return {
    payPeriodType: tenant.payPeriodType ?? DEFAULT_PAY_PERIOD_TYPE,
    defaultPayCurrency: tenant.defaultPayCurrency ?? DEFAULT_PAY_CURRENCY,
    payrollWeekStartDay: tenant.payrollWeekStartDay ?? DEFAULT_PAYROLL_WEEK_START_DAY,
  };
};

export const patchPayrollSettings = async (
  tenantId: string,
  input: PatchPayrollSettingsInput,
  userId: string
): Promise<TenantPayrollSettings> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new PayrollSettingsServiceError('Tenant not found', 404);
  }

  if (input.payPeriodType !== undefined) {
    tenant.payPeriodType = input.payPeriodType;
  }
  if (input.defaultPayCurrency !== undefined) {
    tenant.defaultPayCurrency = input.defaultPayCurrency.toUpperCase();
  }
  if (input.payrollWeekStartDay !== undefined) {
    tenant.payrollWeekStartDay = input.payrollWeekStartDay;
  }

  tenant.updatedBy = new mongoose.Types.ObjectId(userId);
  await tenant.save();

  return getPayrollSettings(tenantId);
};
