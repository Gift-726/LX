import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  googleId?: string;
  facebookId?: string;
  title?: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | '';
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isSuspended: boolean;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionReason?: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetCode?: string;
  resetCodeExpiry?: Date;
  lastSelectedCategory?: mongoose.Types.ObjectId;
  marketingPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  defaultAddress?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    title: { 
      type: String, 
      enum: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', ''],
      default: ''
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    gender: { 
      type: String, 
      enum: ['Male', 'Female', 'Other', ''],
      default: ''
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    suspensionReason: { type: String },
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    resetCode: { type: String },
    resetCodeExpiry: { type: Date },
    lastSelectedCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    marketingPreferences: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    },
    defaultAddress: { type: Schema.Types.ObjectId, ref: 'Address' }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
