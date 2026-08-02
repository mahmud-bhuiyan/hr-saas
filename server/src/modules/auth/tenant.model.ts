import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type TenantApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
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
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectedReason: { type: String, trim: true },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    branding: {
      logoUrl: { type: String, default: null },
      primaryColor: { type: String, default: null },
    },
    attendanceGpsEnabled: { type: Boolean, default: false },
    overtimeThresholdHours: { type: Number, default: 40, min: 1, max: 168 },
    annualEntitlement: { type: Number, default: 25, min: 0, max: 365 },
    maxCarryOverDays: { type: Number, default: 5, min: 0, max: 365 },
    multiStepApprovalEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<ITenantDocument>('Tenant', tenantSchema);
