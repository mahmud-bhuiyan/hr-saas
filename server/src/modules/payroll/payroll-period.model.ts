import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { PayRateType } from '../auth/tenant.model.js';

export type PayrollPeriodStatus = 'draft' | 'generated' | 'exported';

export interface IEmployeePayrollSummary {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  payRate?: number;
  payRateType?: PayRateType;
  payCurrency?: string;
  regularHours: number;
  overtimeHours: number;
  expenseTotal: number;
  grossEstimate: number;
  missingPayRate: boolean;
}

export interface IPayrollPeriod {
  tenantId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  status: PayrollPeriodStatus;
  employeeSummaries: IEmployeePayrollSummary[];
  generatedAt?: Date | null;
  generatedBy?: mongoose.Types.ObjectId | null;
  exportedAt?: Date | null;
  exportedBy?: mongoose.Types.ObjectId | null;
  accountingProvider?: 'xero' | null;
  accountingReference?: string | null;
  accountingSyncedAt?: Date | null;
  accountingSyncedBy?: mongoose.Types.ObjectId | null;
}

export interface IPayrollPeriodDocument extends IPayrollPeriod, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeePayrollSummarySchema = new Schema<IEmployeePayrollSummary>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeName: { type: String, required: true, trim: true },
    payRate: { type: Number, min: 0 },
    payRateType: { type: String, enum: ['hourly', 'salary'] },
    payCurrency: { type: String, trim: true, uppercase: true },
    regularHours: { type: Number, required: true, min: 0, default: 0 },
    overtimeHours: { type: Number, required: true, min: 0, default: 0 },
    expenseTotal: { type: Number, required: true, min: 0, default: 0 },
    grossEstimate: { type: Number, required: true, min: 0, default: 0 },
    missingPayRate: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const payrollPeriodSchema = new Schema<IPayrollPeriodDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'generated', 'exported'],
      default: 'draft',
    },
    employeeSummaries: { type: [employeePayrollSummarySchema], default: [] },
    generatedAt: { type: Date, default: null },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    exportedAt: { type: Date, default: null },
    exportedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    accountingProvider: { type: String, enum: ['xero'], default: null },
    accountingReference: { type: String, default: null, trim: true },
    accountingSyncedAt: { type: Date, default: null },
    accountingSyncedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

payrollPeriodSchema.index({ tenantId: 1, periodStart: 1 });

export const PayrollPeriod: Model<IPayrollPeriodDocument> =
  mongoose.models.PayrollPeriod ??
  mongoose.model<IPayrollPeriodDocument>('PayrollPeriod', payrollPeriodSchema);
