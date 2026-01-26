import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
