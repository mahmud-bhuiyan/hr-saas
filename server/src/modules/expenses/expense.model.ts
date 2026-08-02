import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ExpenseCategory = 'travel' | 'meals' | 'equipment' | 'other';

export type ExpenseStatus = 'pending' | 'approved' | 'declined' | 'reimbursed';

export interface IExpense {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  receiptFileKey: string;
  receiptFileName: string;
  mimeType: string;
  fileSize: number;
  status: ExpenseStatus;
  approverId?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
  declineReason?: string | null;
}

export interface IExpenseDocument extends IExpense, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpenseDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    category: {
      type: String,
      required: true,
      enum: ['travel', 'meals', 'equipment', 'other'],
    },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true, trim: true, uppercase: true, default: 'GBP' },
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    receiptFileKey: { type: String, required: true, trim: true },
    receiptFileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'declined', 'reimbursed'],
      default: 'pending',
    },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    declineReason: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

expenseSchema.index({ tenantId: 1, employeeId: 1, status: 1 });
expenseSchema.index({ tenantId: 1, status: 1, date: -1 });

export const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense ?? mongoose.model<IExpenseDocument>('Expense', expenseSchema);
