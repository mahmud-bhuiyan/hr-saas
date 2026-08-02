import mongoose from 'mongoose';
import type { PayPeriodType } from '../auth/tenant.model.js';
import { Tenant } from '../auth/tenant.model.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { Expense } from '../expenses/expense.model.js';
import { Timesheet } from '../timesheets/timesheet.model.js';
import {
  PayrollPeriod,
  type IEmployeePayrollSummary,
  type IPayrollPeriodDocument,
} from './payroll-period.model.js';
import type { CreatePayrollPeriodInput } from './payroll.validation.js';
import {
  PERIODS_PER_YEAR,
  formatDateOnly,
  getWeekOfMinForPeriod,
  parseDateOnly,
  roundHours,
  roundMoney,
} from './payroll.utils.js';

export class PayrollServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'PayrollServiceError';
  }
}

export interface EmployeePayrollSummaryPublic {
  employeeId: string;
  employeeName: string;
  payRate?: number;
  payRateType?: 'hourly' | 'salary';
  payCurrency?: string;
  regularHours: number;
  overtimeHours: number;
  expenseTotal: number;
  grossEstimate: number;
  missingPayRate: boolean;
}

export interface PayrollPeriodPublic {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: IPayrollPeriodDocument['status'];
  employeeSummaries: EmployeePayrollSummaryPublic[];
  generatedAt?: string;
  generatedBy?: string;
  exportedAt?: string;
  exportedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeAggregation {
  regularHours: number;
  overtimeHours: number;
  expenseTotal: number;
}

const toSummaryPublic = (summary: IEmployeePayrollSummary): EmployeePayrollSummaryPublic => ({
  employeeId: summary.employeeId.toString(),
  employeeName: summary.employeeName,
  payRate: summary.payRate,
  payRateType: summary.payRateType,
  payCurrency: summary.payCurrency,
  regularHours: summary.regularHours,
  overtimeHours: summary.overtimeHours,
  expenseTotal: summary.expenseTotal,
  grossEstimate: summary.grossEstimate,
  missingPayRate: summary.missingPayRate,
});

const toPeriodPublic = (period: IPayrollPeriodDocument): PayrollPeriodPublic => ({
  id: period._id.toString(),
  periodStart: formatDateOnly(period.periodStart),
  periodEnd: formatDateOnly(period.periodEnd),
  status: period.status,
  employeeSummaries: period.employeeSummaries.map(toSummaryPublic),
  generatedAt: period.generatedAt?.toISOString(),
  generatedBy: period.generatedBy?.toString(),
  exportedAt: period.exportedAt?.toISOString(),
  exportedBy: period.exportedBy?.toString(),
  createdAt: period.createdAt.toISOString(),
  updatedAt: period.updatedAt.toISOString(),
});

const periodAuditSnapshot = (period: IPayrollPeriodDocument): Record<string, unknown> => ({
  periodStart: formatDateOnly(period.periodStart),
  periodEnd: formatDateOnly(period.periodEnd),
  status: period.status,
  employeeCount: period.employeeSummaries.length,
  totalGross: roundMoney(
    period.employeeSummaries.reduce((sum, row) => sum + row.grossEstimate, 0)
  ),
});

const computeGrossEstimate = (
  employee: IEmployeeDocument | undefined,
  regularHours: number,
  overtimeHours: number,
  expenseTotal: number,
  payPeriodType: PayPeriodType
): { grossEstimate: number; missingPayRate: boolean } => {
  if (!employee?.payRate || !employee.payRateType) {
    return { grossEstimate: 0, missingPayRate: true };
  }

  if (employee.payRateType === 'hourly') {
    return {
      grossEstimate: roundMoney((regularHours + overtimeHours) * employee.payRate + expenseTotal),
      missingPayRate: false,
    };
  }

  const periodsPerYear = PERIODS_PER_YEAR[payPeriodType];
  return {
    grossEstimate: roundMoney(employee.payRate / periodsPerYear + expenseTotal),
    missingPayRate: false,
  };
};

const buildEmployeeSummaries = async (
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  defaultCurrency: string,
  payPeriodType: PayPeriodType
): Promise<IEmployeePayrollSummary[]> => {
  const weekOfMin = getWeekOfMinForPeriod(periodStart);

  const [timesheets, expenses] = await Promise.all([
    Timesheet.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      status: 'approved',
      weekOf: { $gte: weekOfMin, $lte: periodEnd },
    }).lean(),
    Expense.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      status: { $in: ['approved', 'reimbursed'] },
      date: { $gte: periodStart, $lte: periodEnd },
    }).lean(),
  ]);

  const aggregation = new Map<string, EmployeeAggregation>();

  const ensureAgg = (employeeId: string): EmployeeAggregation => {
    const existing = aggregation.get(employeeId);
    if (existing) return existing;
    const created = { regularHours: 0, overtimeHours: 0, expenseTotal: 0 };
    aggregation.set(employeeId, created);
    return created;
  };

  for (const timesheet of timesheets) {
    const employeeId = timesheet.employeeId.toString();
    const agg = ensureAgg(employeeId);
    const regular = Math.max(0, timesheet.totalHours - timesheet.overtimeHours);
    agg.regularHours = roundHours(agg.regularHours + regular);
    agg.overtimeHours = roundHours(agg.overtimeHours + timesheet.overtimeHours);
  }

  for (const expense of expenses) {
    const employeeId = expense.employeeId.toString();
    const agg = ensureAgg(employeeId);
    agg.expenseTotal = roundMoney(agg.expenseTotal + expense.amount);
  }

  if (aggregation.size === 0) {
    return [];
  }

  const employeeIds = [...aggregation.keys()].map((id) => new mongoose.Types.ObjectId(id));
  const employees = await Employee.find({
    _id: { $in: employeeIds },
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  const employeeMap = new Map(employees.map((employee) => [employee._id.toString(), employee]));

  const summaries: IEmployeePayrollSummary[] = [];

  for (const [employeeId, agg] of aggregation) {
    const employee = employeeMap.get(employeeId);
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`.trim()
      : 'Unknown employee';

    const { grossEstimate, missingPayRate } = computeGrossEstimate(
      employee,
      agg.regularHours,
      agg.overtimeHours,
      agg.expenseTotal,
      payPeriodType
    );

    summaries.push({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      employeeName,
      payRate: employee?.payRate,
      payRateType: employee?.payRateType,
      payCurrency: employee?.payCurrency ?? defaultCurrency,
      regularHours: agg.regularHours,
      overtimeHours: agg.overtimeHours,
      expenseTotal: agg.expenseTotal,
      grossEstimate,
      missingPayRate,
    });
  }

  summaries.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  return summaries;
};

export const listPayrollPeriods = async (tenantId: string): Promise<PayrollPeriodPublic[]> => {
  const periods = await PayrollPeriod.find({ tenantId: new mongoose.Types.ObjectId(tenantId) })
    .sort({ periodStart: -1 })
    .lean();

  return periods.map((period) =>
    toPeriodPublic(period as unknown as IPayrollPeriodDocument)
  );
};

export const getPayrollPeriod = async (
  tenantId: string,
  periodId: string
): Promise<PayrollPeriodPublic> => {
  if (!mongoose.isValidObjectId(periodId)) {
    throw new PayrollServiceError('Invalid payroll period id', 400);
  }

  const period = await PayrollPeriod.findOne({
    _id: periodId,
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!period) {
    throw new PayrollServiceError('Payroll period not found', 404);
  }

  return toPeriodPublic(period);
};

export const createPayrollPeriod = async (
  tenantId: string,
  input: CreatePayrollPeriodInput,
  userId: string,
  auditContext?: AuditContext
): Promise<PayrollPeriodPublic> => {
  const periodStart = parseDateOnly(input.periodStart);
  const periodEnd = parseDateOnly(input.periodEnd);

  const period = await PayrollPeriod.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    periodStart,
    periodEnd,
    status: 'draft',
    employeeSummaries: [],
  });

  await writeAuditLog({
    tenantId,
    userId,
    action: 'create',
    entityType: 'PayrollPeriod',
    entityId: period._id.toString(),
    after: periodAuditSnapshot(period),
    context: auditContext,
  });

  return toPeriodPublic(period);
};

export const generatePayrollPeriod = async (
  tenantId: string,
  periodId: string,
  userId: string,
  auditContext?: AuditContext
): Promise<PayrollPeriodPublic> => {
  if (!mongoose.isValidObjectId(periodId)) {
    throw new PayrollServiceError('Invalid payroll period id', 400);
  }

  const period = await PayrollPeriod.findOne({
    _id: periodId,
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!period) {
    throw new PayrollServiceError('Payroll period not found', 404);
  }

  if (period.status === 'exported') {
    throw new PayrollServiceError('Cannot regenerate an exported payroll period', 409);
  }

  const tenant = await Tenant.findById(tenantId).select('payPeriodType defaultPayCurrency');
  if (!tenant) {
    throw new PayrollServiceError('Tenant not found', 404);
  }

  const payPeriodType = tenant.payPeriodType ?? 'weekly';
  const defaultCurrency = tenant.defaultPayCurrency ?? 'GBP';
  const before = periodAuditSnapshot(period);

  period.employeeSummaries = await buildEmployeeSummaries(
    tenantId,
    period.periodStart,
    period.periodEnd,
    defaultCurrency,
    payPeriodType
  );
  period.status = 'generated';
  period.generatedAt = new Date();
  period.generatedBy = new mongoose.Types.ObjectId(userId);
  await period.save();

  await writeAuditLog({
    tenantId,
    userId,
    action: 'update',
    entityType: 'PayrollPeriod',
    entityId: period._id.toString(),
    before,
    after: periodAuditSnapshot(period),
    context: auditContext,
  });

  return toPeriodPublic(period);
};
