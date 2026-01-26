import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorites extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoritesSchema = new Schema<IFavorites>(
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

// Prevent duplicate entries (user can't add same product twice)
favoritesSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster queries
favoritesSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IFavorites>('Favorites', favoritesSchema);
