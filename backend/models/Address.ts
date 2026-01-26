import mongoose, { Document, Schema } from 'mongoose';

export type AddressType = 'home' | 'work' | 'other';
export type TitleType = 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | '';

export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title?: TitleType;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country: string;
  region?: string;
  city: string;
  address: string;
  postalCode?: string;
  isDefault: boolean;
  addressType: AddressType;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      enum: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', ''],
      default: ''
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    region: { type: String },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String },
    isDefault: { type: Boolean, default: false },
    addressType: { 
      type: String, 
      enum: ['home', 'work', 'other'],
      default: 'home'
    }
  },
  { timestamps: true }
);

// Index for faster queries
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

export default mongoose.model<IAddress>('Address', addressSchema);
