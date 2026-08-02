import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { FaviconMimeType, LogoObjectFit, LogoShape } from '../../constants/platform-settings.js';

export interface ILogoDisplay {
  heightPx: number;
  maxWidthPx: number;
  objectFit: LogoObjectFit;
  shape: LogoShape;
  showSiteName: boolean;
}

export interface IFaviconDisplay {
  mimeType: FaviconMimeType;
}

export interface IPlatformSettings {
  key: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  logoDisplay: ILogoDisplay;
  faviconDisplay: IFaviconDisplay;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IPlatformSettingsDocument extends IPlatformSettings, Document {
  _id: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const logoDisplaySchema = new Schema<ILogoDisplay>(
  {
    heightPx: { type: Number, default: 32, min: 24, max: 80 },
    maxWidthPx: { type: Number, default: 160, min: 80, max: 320 },
    objectFit: { type: String, enum: ['contain', 'cover'], default: 'contain' },
    shape: { type: String, enum: ['default', 'circle'], default: 'circle' },
    showSiteName: { type: Boolean, default: false },
  },
  { _id: false }
);

const faviconDisplaySchema = new Schema<IFaviconDisplay>(
  {
    mimeType: {
      type: String,
      enum: ['auto', 'image/png', 'image/x-icon', 'image/svg+xml', 'image/webp'],
      default: 'auto',
    },
  },
  { _id: false }
);

const platformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    siteName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: null },
    faviconUrl: { type: String, default: null },
    primaryColor: { type: String, required: true },
    logoDisplay: { type: logoDisplaySchema, default: () => ({}) },
    faviconDisplay: { type: faviconDisplaySchema, default: () => ({}) },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const PlatformSettings: Model<IPlatformSettingsDocument> =
  mongoose.models.PlatformSettings ??
  mongoose.model<IPlatformSettingsDocument>('PlatformSettings', platformSettingsSchema);
