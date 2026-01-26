import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  productTitle: string;
  productBrand?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    order: { 
      type: Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    variant: { 
      type: Schema.Types.ObjectId, 
      ref: 'ProductVariant' 
    },
    productTitle: { type: String, required: true },
    productBrand: { type: String },
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  },
  { timestamps: true }
);

// Index for faster queries
orderItemSchema.index({ order: 1 });

export default mongoose.model<IOrderItem>('OrderItem', orderItemSchema);
