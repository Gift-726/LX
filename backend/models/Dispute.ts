import mongoose, { Document, Schema } from 'mongoose';

export type DisputeReason = 'didnt_receive' | 'took_longer_than_expected' | 'not_what_ordered' | 'damage_bad_goods' | 'apply_for_refund' | 'others';
export type DisputeStatus = 'pending' | 'under_review' | 'resolved' | 'rejected' | 'refunded';

export interface IDispute extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  orderItem?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  goodsUniqueId?: string;
  reasons: DisputeReason[];
  detailedExplanation: string;
  status: DisputeStatus;
  adminResponse?: string;
  refundAmount?: number;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    order: { 
      type: Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    orderItem: { 
      type: Schema.Types.ObjectId, 
      ref: 'OrderItem' 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    goodsUniqueId: { type: String },
    reasons: [{
      type: String,
      enum: [
        'didnt_receive',
        'took_longer_than_expected',
        'not_what_ordered',
        'damage_bad_goods',
        'apply_for_refund',
        'others'
      ]
    }],
    detailedExplanation: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'under_review', 'resolved', 'rejected', 'refunded'],
      default: 'pending'
    },
    adminResponse: { type: String },
    refundAmount: { type: Number },
    resolvedAt: { type: Date },
    resolvedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Index for faster queries
disputeSchema.index({ user: 1, createdAt: -1 });
disputeSchema.index({ order: 1 });
disputeSchema.index({ status: 1 });

export default mongoose.model<IDispute>('Dispute', disputeSchema);
