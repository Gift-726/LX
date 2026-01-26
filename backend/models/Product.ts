import mongoose, { Document, Schema } from 'mongoose';

export type ProductBadge = 'HOT' | 'NEW' | 'SALE' | 'BESTSELLER' | 'LIMITED';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  currency: string;
  displayCurrency?: string;
  displayPrice?: number;
  discountPercentage: number;
  category: mongoose.Types.ObjectId;
  brand?: string;
  releaseDate?: Date;
  images: string[];
  tags: string[];
  rating: number;
  salesCount: number;
  stock: number;
  createdBy?: mongoose.Types.ObjectId;
  isFeatured: boolean;
  featuredAt?: Date;
  featuredUntil?: Date;
  badges: ProductBadge[];
  hasVariants: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    displayCurrency: { type: String, default: 'USD' },
    displayPrice: { type: Number },
    discountPercentage: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String },
    releaseDate: { type: Date },
    images: [{ type: String }],
    tags: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    salesCount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isFeatured: { type: Boolean, default: false },
    featuredAt: { type: Date },
    featuredUntil: { type: Date },
    badges: [{ 
      type: String, 
      enum: ['HOT', 'NEW', 'SALE', 'BESTSELLER', 'LIMITED'] 
    }],
    hasVariants: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
