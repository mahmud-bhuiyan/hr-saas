import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ShiftStatus = 'draft' | 'published' | 'open';

export interface IShift {
  tenantId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId | null;
  date: string;
  startTime: string;
  endTime: string;
  role?: string;
  locationId: mongoose.Types.ObjectId;
  status: ShiftStatus;
  publishedAt?: Date | null;
  claimedBy?: mongoose.Types.ObjectId | null;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IShiftDocument extends IShift, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShiftDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    date: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WorkLocation', required: true },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published', 'open'],
      default: 'draft',
    },
    publishedAt: { type: Date, default: null },
    claimedBy: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

shiftSchema.index({ tenantId: 1, date: 1 });
shiftSchema.index({ tenantId: 1, employeeId: 1, date: 1 });

export const Shift: Model<IShiftDocument> =
  mongoose.models.Shift ?? mongoose.model<IShiftDocument>('Shift', shiftSchema);
