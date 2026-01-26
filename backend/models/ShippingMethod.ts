import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingMethod extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  deliveryTime?: string;
  deliveryTimeDays?: number;
  baseCost: number;
  costPerKg: number;
  isActive: boolean;
  availableCountries: string[];
  minOrderValue: number;
  maxWeight?: number;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    deliveryTime: { type: String },
    deliveryTimeDays: { type: Number },
    baseCost: { type: Number, default: 0 },
    costPerKg: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    availableCountries: [{ type: String }],
    minOrderValue: { type: Number, default: 0 },
    maxWeight: { type: Number },
    icon: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IShippingMethod>('ShippingMethod', shippingMethodSchema);
