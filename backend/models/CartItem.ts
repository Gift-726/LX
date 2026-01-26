import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  cart: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    cart: { 
      type: Schema.Types.ObjectId, 
      ref: 'Cart', 
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
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

// Index to prevent duplicate items
cartItemSchema.index({ cart: 1, product: 1, variant: 1 }, { unique: true });

export default mongoose.model<ICartItem>('CartItem', cartItemSchema);
