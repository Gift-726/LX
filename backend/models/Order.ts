import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ITrackingStep {
  completed: boolean;
  completedAt?: Date;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  shippingAddress: mongoose.Types.ObjectId;
  contactEmail: string;
  contactPhone: string;
  shippingMethod?: mongoose.Types.ObjectId;
  shippingMethodName?: string;
  shippingCost: number;
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paystackReference?: string;
  paystackAuthorizationUrl?: string;
  paymentVerifiedAt?: Date;
  refundReference?: string;
  refundReason?: string;
  refundedAt?: Date;
  notes?: string;
  estimatedDelivery?: Date;
  trackingSteps: {
    packaging: ITrackingStep;
    checking: ITrackingStep;
    shipping: ITrackingStep;
    delivery: ITrackingStep;
    readyForPickup: ITrackingStep;
  };
  dispute?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    shippingAddress: { 
      type: Schema.Types.ObjectId, 
      ref: 'Address', 
      required: true 
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    shippingMethod: { 
      type: Schema.Types.ObjectId, 
      ref: 'ShippingMethod' 
    },
    shippingMethodName: { type: String },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { type: String },
    paymentReference: { type: String },
    paystackReference: { type: String },
    paystackAuthorizationUrl: { type: String },
    paymentVerifiedAt: { type: Date },
    refundReference: { type: String },
    refundReason: { type: String },
    refundedAt: { type: Date },
    notes: { type: String },
    estimatedDelivery: { type: Date },
    trackingSteps: {
      packaging: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
      checking: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
      shipping: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
      delivery: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
      readyForPickup: { completed: { type: Boolean, default: false }, completedAt: { type: Date } }
    },
    dispute: { 
      type: Schema.Types.ObjectId, 
      ref: 'Dispute' 
    }
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
