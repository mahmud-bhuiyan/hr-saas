import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IStripeEvent {
  eventId: string;
  processedAt: Date;
}

export interface IStripeEventDocument extends IStripeEvent, Document {
  _id: mongoose.Types.ObjectId;
}

const stripeEventSchema = new Schema<IStripeEventDocument>(
  {
    eventId: { type: String, required: true, unique: true },
    processedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false }
);

export const StripeEvent: Model<IStripeEventDocument> =
  mongoose.models.StripeEvent ??
  mongoose.model<IStripeEventDocument>('StripeEvent', stripeEventSchema);
