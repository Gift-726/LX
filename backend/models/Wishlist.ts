import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    }
  },
  { timestamps: true }
);

// Prevent duplicate entries
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster queries
wishlistSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
