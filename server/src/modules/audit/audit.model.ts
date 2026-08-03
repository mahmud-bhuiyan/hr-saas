import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type AuditAction = 'create' | 'update' | 'delete';

export type AuditEntityType =
  | 'Employee'
  | 'HrDocument'
  | 'User'
  | 'LeaveRequest'
  | 'AttendanceLog'
  | 'Timesheet'
  | 'Expense'
  | 'Subscription'
  | 'WorkLocation'
  | 'Shift'
  | 'PayrollPeriod'
  | 'Tenant';

export interface IAuditLog {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: mongoose.Types.ObjectId;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

export interface IAuditLogDocument extends IAuditLog, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete'],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Employee', 'HrDocument', 'User', 'LeaveRequest', 'AttendanceLog', 'Timesheet', 'Expense', 'Subscription', 'WorkLocation', 'Shift', 'PayrollPeriod', 'Tenant'],
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });
auditLogSchema.index({ tenantId: 1, userId: 1 });

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
