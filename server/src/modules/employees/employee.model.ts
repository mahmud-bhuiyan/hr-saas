import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export interface IEmployee {
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: Date;
  managerId?: mongoose.Types.ObjectId | null;
  status: EmployeeStatus;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IEmployeeDocument extends IEmployee, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployeeDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    employeeNumber: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    department: { type: String, trim: true },
    startDate: { type: Date },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: {
      type: String,
      required: true,
      enum: ['active', 'on_leave', 'terminated'],
      default: 'active',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

employeeSchema.index({ tenantId: 1, employeeNumber: 1 }, { unique: true });
employeeSchema.index({ tenantId: 1, status: 1 });
employeeSchema.index({ tenantId: 1, department: 1 });
employeeSchema.index({ tenantId: 1, managerId: 1 });

export const Employee: Model<IEmployeeDocument> =
  mongoose.models.Employee ?? mongoose.model<IEmployeeDocument>('Employee', employeeSchema);
