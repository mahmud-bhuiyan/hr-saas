import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IDepartment {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  isArchived: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartmentDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

departmentSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Department: Model<IDepartmentDocument> =
  mongoose.models.Department ??
  mongoose.model<IDepartmentDocument>('Department', departmentSchema);
