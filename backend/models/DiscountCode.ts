import mongoose, { Document, Schema } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';

export interface IDiscountCode extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  userLimit: number;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableProducts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const discountCodeSchema = new Schema<IDiscountCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    discountType: { 
      type: String, 
      enum: ['percentage', 'fixed'],
      required: true 
    },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 },
    applicableCategories: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Category' 
    }],
    applicableProducts: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Product' 
    }]
  },
  { timestamps: true }
);

// Index for faster lookups
discountCodeSchema.index({ code: 1, isActive: 1 });
discountCodeSchema.index({ validFrom: 1, validUntil: 1 });

export default mongoose.model<IDiscountCode>('DiscountCode', discountCodeSchema);
