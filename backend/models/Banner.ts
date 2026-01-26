import mongoose, { Document, Schema } from 'mongoose';

export type BannerStatus = 'active' | 'inactive';

export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  heading?: string;
  bodyText?: string;
  buttonText?: string;
  buttonUrl?: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  status: BannerStatus;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    heading: { type: String },
    bodyText: { type: String },
    buttonText: { type: String },
    buttonUrl: { type: String },
    image: { type: String },
    backgroundColor: { type: String, default: '#8B5CF6' },
    textColor: { type: String, default: '#FFFFFF' },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Index for faster queries
bannerSchema.index({ status: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IBanner>('Banner', bannerSchema);
