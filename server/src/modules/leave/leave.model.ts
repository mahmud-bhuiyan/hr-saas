import mongoose, { Schema, type Document, type Model } from "mongoose";

export type LeaveType = "planned" | "unplanned" | "unpaid" | "annual" | "sick";
export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled";

export interface ILeaveRequest {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  halfDay: boolean;
  reason?: string;
  status: LeaveRequestStatus;
  approverId?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
  declineReason?: string;
  approvalStep?: number;
}

export interface ILeaveRequestDocument extends ILeaveRequest, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveBalance {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  year: number;
  entitlement: number;
  taken: number;
  pending: number;
  carriedOver: number;
}

export interface ILeaveBalanceDocument extends ILeaveBalance, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["planned", "unplanned", "unpaid", "annual", "sick"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    halfDay: { type: Boolean, default: false },
    reason: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "declined", "cancelled"],
      default: "pending",
    },
    approverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    declineReason: { type: String, trim: true },
    approvalStep: { type: Number, default: 1, min: 1, max: 2 },
  },
  { timestamps: true },
);

leaveRequestSchema.index({ tenantId: 1, employeeId: 1, status: 1 });
leaveRequestSchema.index({ tenantId: 1, status: 1, startDate: 1 });

const leaveBalanceSchema = new Schema<ILeaveBalanceDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    year: { type: Number, required: true },
    entitlement: { type: Number, required: true, default: 25 },
    taken: { type: Number, required: true, default: 0 },
    pending: { type: Number, required: true, default: 0 },
    carriedOver: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

leaveBalanceSchema.index(
  { tenantId: 1, employeeId: 1, year: 1 },
  { unique: true },
);

export const LeaveRequest: Model<ILeaveRequestDocument> =
  mongoose.models.LeaveRequest ??
  mongoose.model<ILeaveRequestDocument>("LeaveRequest", leaveRequestSchema);

export const LeaveBalance: Model<ILeaveBalanceDocument> =
  mongoose.models.LeaveBalance ??
  mongoose.model<ILeaveBalanceDocument>("LeaveBalance", leaveBalanceSchema);
