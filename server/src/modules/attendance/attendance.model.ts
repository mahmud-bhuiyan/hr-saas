import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type AttendanceMethod = 'web' | 'app' | 'kiosk';

export interface AttendanceLocation {
  lat: number;
  lng: number;
}

export interface IAttendanceLog {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  clockIn: Date;
  clockOut?: Date | null;
  method: AttendanceMethod;
  location?: AttendanceLocation | null;
  notes?: string;
  correctedBy?: mongoose.Types.ObjectId | null;
}

export interface IAttendanceLogDocument extends IAttendanceLog, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceLogSchema = new Schema<IAttendanceLogDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date, default: null },
    method: {
      type: String,
      required: true,
      enum: ['web', 'app', 'kiosk'],
      default: 'web',
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String, trim: true },
    correctedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ tenantId: 1, employeeId: 1, clockIn: -1 });
attendanceLogSchema.index({ tenantId: 1, employeeId: 1, clockOut: 1 });

export const AttendanceLog: Model<IAttendanceLogDocument> =
  mongoose.models.AttendanceLog ??
  mongoose.model<IAttendanceLogDocument>('AttendanceLog', attendanceLogSchema);
