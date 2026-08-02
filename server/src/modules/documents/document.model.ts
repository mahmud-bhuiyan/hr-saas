import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type DocumentCategory = 'contract' | 'id' | 'certification' | 'other';

export interface IHrDocument {
  tenantId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId | null;
  category: DocumentCategory;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  expiryDate?: Date | null;
}

export interface IHrDocumentDocument extends IHrDocument, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hrDocumentSchema = new Schema<IHrDocumentDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    category: {
      type: String,
      required: true,
      enum: ['contract', 'id', 'certification', 'other'],
    },
    fileKey: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 1 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

hrDocumentSchema.index({ tenantId: 1, employeeId: 1, category: 1 });
hrDocumentSchema.index({ tenantId: 1, expiryDate: 1 });

export const HrDocument: Model<IHrDocumentDocument> =
  mongoose.models.HrDocument ?? mongoose.model<IHrDocumentDocument>('HrDocument', hrDocumentSchema);
