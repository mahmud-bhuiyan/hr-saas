import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ITenant {
  name: string;
  isActive: boolean;
}

export interface ITenantDocument extends ITenant, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenantDocument>(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<ITenantDocument>('Tenant', tenantSchema);
