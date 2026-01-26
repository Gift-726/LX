import mongoose, { Document, Schema } from 'mongoose';

export interface ITermsAndCondition extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  version: number;
  isActive: boolean;
  effectiveDate: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const termsAndConditionSchema = new Schema<ITermsAndCondition>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    effectiveDate: { type: Date, default: Date.now },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Index for faster queries
termsAndConditionSchema.index({ isActive: 1, effectiveDate: -1 });

export default mongoose.model<ITermsAndCondition>('TermsAndCondition', termsAndConditionSchema);
