import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  ALL_TENANT_MODULE_IDS,
  type TenantModuleId,
} from "../../types/modules.js";

export type TenantApprovalStatus = "pending" | "approved" | "rejected";

export type PayPeriodType = "weekly" | "biweekly" | "monthly";

export type PayRateType = "hourly" | "salary";

export interface TenantBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
}

export interface ITenant {
  name: string;
  address?: string;
  logoUrl?: string | null;
  isActive: boolean;
  approvalStatus: TenantApprovalStatus;
  rejectedReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  branding?: TenantBranding;
  attendanceGpsEnabled?: boolean;
  overtimeThresholdHours?: number;
  annualEntitlement?: number;
  maxCarryOverDays?: number;
  multiStepApprovalEnabled?: boolean;
  billingExempt?: boolean;
  payPeriodType?: PayPeriodType;
  defaultPayCurrency?: string;
  defaultPhoneDialCode?: string;
  payrollWeekStartDay?: number;
  xeroExpenseAccountCode?: string;
  xeroPayableAccountCode?: string;
  enabledModules?: TenantModuleId[];
}

export interface ITenantDocument extends ITenant, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenantDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    logoUrl: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectedReason: { type: String, trim: true },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    branding: {
      logoUrl: { type: String, default: null },
      faviconUrl: { type: String, default: null },
    },
    attendanceGpsEnabled: { type: Boolean, default: false },
    overtimeThresholdHours: { type: Number, default: 40, min: 1, max: 168 },
    annualEntitlement: { type: Number, default: 25, min: 0, max: 365 },
    maxCarryOverDays: { type: Number, default: 5, min: 0, max: 365 },
    multiStepApprovalEnabled: { type: Boolean, default: false },
    billingExempt: { type: Boolean, default: false },
    payPeriodType: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      default: "weekly",
    },
    defaultPayCurrency: {
      type: String,
      default: "GBP",
      trim: true,
      uppercase: true,
    },
    defaultPhoneDialCode: { type: String, default: "1", trim: true },
    payrollWeekStartDay: { type: Number, default: 1, min: 0, max: 6 },
    xeroExpenseAccountCode: { type: String, default: "477", trim: true },
    xeroPayableAccountCode: { type: String, default: "804", trim: true },
    enabledModules: {
      type: [String],
      enum: ALL_TENANT_MODULE_IDS,
      default: () => [...ALL_TENANT_MODULE_IDS],
    },
  },
  { timestamps: true },
);

export const Tenant: Model<ITenantDocument> =
  mongoose.models.Tenant ??
  mongoose.model<ITenantDocument>("Tenant", tenantSchema);
