import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IRotaTemplateShift {
  startTime: string;
  endTime: string;
  role?: string;
  locationId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId | null;
}

export interface IRotaTemplateDay {
  dayOfWeek: number;
  shifts: IRotaTemplateShift[];
}

export interface IRotaTemplate {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  weekPattern: IRotaTemplateDay[];
  createdBy?: mongoose.Types.ObjectId;
}

export interface IRotaTemplateDocument extends IRotaTemplate, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rotaTemplateShiftSchema = new Schema<IRotaTemplateShift>(
  {
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'WorkLocation', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { _id: false }
);

const rotaTemplateDaySchema = new Schema<IRotaTemplateDay>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    shifts: { type: [rotaTemplateShiftSchema], default: [] },
  },
  { _id: false }
);

const rotaTemplateSchema = new Schema<IRotaTemplateDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    weekPattern: { type: [rotaTemplateDaySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

rotaTemplateSchema.index({ tenantId: 1, name: 1 });

export const RotaTemplate: Model<IRotaTemplateDocument> =
  mongoose.models.RotaTemplate ??
  mongoose.model<IRotaTemplateDocument>('RotaTemplate', rotaTemplateSchema);
