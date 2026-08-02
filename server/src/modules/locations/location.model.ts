import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IWorkLocation {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  timezone?: string;
  isArchived: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IWorkLocationDocument extends IWorkLocation, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workLocationSchema = new Schema<IWorkLocationDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, trim: true },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

workLocationSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const WorkLocation: Model<IWorkLocationDocument> =
  mongoose.models.WorkLocation ??
  mongoose.model<IWorkLocationDocument>('WorkLocation', workLocationSchema);
