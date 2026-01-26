import mongoose, { Document, Schema } from 'mongoose';

export type VariantSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'One Size';

export interface IProductVariant extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  size: VariantSize;
  color: string;
  colorCode?: string;
  price?: number;
  stock: number;
  images: string[];
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    size: { 
      type: String, 
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']
    },
    color: { 
      type: String, 
      required: true 
    },
    colorCode: { type: String },
    price: { type: Number },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    sku: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

// Index for faster queries
productVariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
productVariantSchema.index({ product: 1 });

export default mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
