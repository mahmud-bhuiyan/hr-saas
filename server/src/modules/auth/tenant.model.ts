import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type TenantApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ITenant {
  name: string;
  isActive: boolean;
  approvalStatus: TenantApprovalStatus;
  rejectedReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
}

export interface ITenantDocument extends ITenant, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenantDocument>(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectedReason: { type: String, trim: true },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<ITenantDocument>('Tenant', tenantSchema);
