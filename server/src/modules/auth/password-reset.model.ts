import { createHash, randomBytes } from 'node:crypto';
import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPasswordResetToken {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
}

export interface IPasswordResetTokenDocument extends IPasswordResetToken, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken: Model<IPasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ??
  mongoose.model<IPasswordResetTokenDocument>('PasswordResetToken', passwordResetTokenSchema);

export const hashResetToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const generateResetToken = (): { token: string; tokenHash: string } => {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: hashResetToken(token) };
};

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
