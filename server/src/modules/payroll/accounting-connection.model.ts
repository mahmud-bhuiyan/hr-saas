import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type AccountingProvider = 'xero';

export interface IAccountingConnection {
  tenantId: mongoose.Types.ObjectId;
  provider: AccountingProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  externalTenantId: string;
  externalTenantName: string;
  connectedAt: Date;
  connectedBy: mongoose.Types.ObjectId;
}

export interface IAccountingConnectionDocument extends IAccountingConnection, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const accountingConnectionSchema = new Schema<IAccountingConnectionDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    provider: { type: String, enum: ['xero'], required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    externalTenantId: { type: String, required: true, trim: true },
    externalTenantName: { type: String, required: true, trim: true },
    connectedAt: { type: Date, required: true },
    connectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

accountingConnectionSchema.index({ tenantId: 1, provider: 1 }, { unique: true });

export const AccountingConnection: Model<IAccountingConnectionDocument> =
  mongoose.models.AccountingConnection ??
  mongoose.model<IAccountingConnectionDocument>(
    'AccountingConnection',
    accountingConnectionSchema
  );
