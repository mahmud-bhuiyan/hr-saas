import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type TimesheetEntrySource = 'attendance' | 'manual';

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'declined';

export interface ITimesheetEntry {
  date: Date;
  hours: number;
  source: TimesheetEntrySource;
  attendanceLogId?: mongoose.Types.ObjectId | null;
  notes?: string;
}

export interface ITimesheet {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  weekOf: Date;
  entries: ITimesheetEntry[];
  totalHours: number;
  overtimeHours: number;
  status: TimesheetStatus;
  submittedAt?: Date | null;
  approverId?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
  declineReason?: string | null;
}

export interface ITimesheetDocument extends ITimesheet, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const timesheetEntrySchema = new Schema<ITimesheetEntry>(
  {
    date: { type: Date, required: true },
    hours: { type: Number, required: true, min: 0, default: 0 },
    source: {
      type: String,
      required: true,
      enum: ['attendance', 'manual'],
      default: 'attendance',
    },
    attendanceLogId: { type: Schema.Types.ObjectId, ref: 'AttendanceLog', default: null },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const timesheetSchema = new Schema<ITimesheetDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    weekOf: { type: Date, required: true },
    entries: { type: [timesheetEntrySchema], default: [] },
    totalHours: { type: Number, required: true, min: 0, default: 0 },
    overtimeHours: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'declined'],
      default: 'draft',
    },
    submittedAt: { type: Date, default: null },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    declineReason: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

timesheetSchema.index({ tenantId: 1, employeeId: 1, weekOf: 1 }, { unique: true });
timesheetSchema.index({ tenantId: 1, status: 1 });

export const Timesheet: Model<ITimesheetDocument> =
  mongoose.models.Timesheet ?? mongoose.model<ITimesheetDocument>('Timesheet', timesheetSchema);
