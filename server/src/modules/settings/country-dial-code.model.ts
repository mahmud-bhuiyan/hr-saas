import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  DEFAULT_MAX_NATIONAL_LENGTH,
  DEFAULT_MIN_NATIONAL_LENGTH,
  E164_MAX_TOTAL_DIGITS,
} from "../../constants/phone.js";

export interface ICountryDialCode {
  code: string;
  name: string;
  dialCode: string;
  minNationalLength: number;
  maxNationalLength: number;
  isArchived: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface ICountryDialCodeDocument extends ICountryDialCode, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const countryDialCodeSchema = new Schema<ICountryDialCodeDocument>(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    dialCode: { type: String, required: true, trim: true },
    minNationalLength: {
      type: Number,
      required: true,
      default: DEFAULT_MIN_NATIONAL_LENGTH,
      min: 1,
      max: E164_MAX_TOTAL_DIGITS,
    },
    maxNationalLength: {
      type: Number,
      required: true,
      default: DEFAULT_MAX_NATIONAL_LENGTH,
      min: 1,
      max: E164_MAX_TOTAL_DIGITS,
    },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

countryDialCodeSchema.index({ code: 1 }, { unique: true });

export const CountryDialCode: Model<ICountryDialCodeDocument> =
  mongoose.models.CountryDialCode ??
  mongoose.model<ICountryDialCodeDocument>(
    "CountryDialCode",
    countryDialCodeSchema,
  );
