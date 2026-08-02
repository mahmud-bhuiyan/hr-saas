import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export interface ISubscription {
  tenantId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId?: string;
  status: SubscriptionStatus;
  seatCount: number;
  currentPeriodEnd?: Date;
}

export interface ISubscriptionDocument extends ISubscription, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    stripeCustomerId: { type: String, required: true, index: true },
    stripeSubscriptionId: { type: String, required: true, index: true },
    stripeSubscriptionItemId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['trialing', 'active', 'past_due', 'canceled', 'incomplete'],
    },
    seatCount: { type: Number, required: true, min: 1 },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscriptionDocument> =
  mongoose.models.Subscription ??
  mongoose.model<ISubscriptionDocument>('Subscription', subscriptionSchema);
