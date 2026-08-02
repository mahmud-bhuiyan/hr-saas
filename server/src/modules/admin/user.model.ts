import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { ColorScheme, UserRole } from '../../types/index.js';

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  tenantId?: mongoose.Types.ObjectId | null;
  firstName?: string;
  lastName?: string;
  colorScheme: ColorScheme;
  isActive: boolean;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['super_admin', 'company_admin', 'hr_manager', 'manager', 'employee'],
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    colorScheme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', userSchema);
