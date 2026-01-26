import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'order' | 'promotion' | 'system' | 'alert';
export type RecipientType = 'user' | 'admin' | 'all' | 'users' | 'admins';
export type DeliveryMethod = 'push' | 'email' | 'sms';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  recipientType: RecipientType;
  title: string;
  message: string;
  header?: string;
  body?: string;
  isRead: boolean;
  type: NotificationType;
  relatedId?: mongoose.Types.ObjectId;
  scheduledDate?: Date;
  scheduledTime?: string;
  deliveryMethod: DeliveryMethod[];
  isScheduled: boolean;
  isSent: boolean;
  sentAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientType: { 
      type: String, 
      enum: ['user', 'admin', 'all', 'users', 'admins'], 
      default: 'all' 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    header: { type: String },
    body: { type: String },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['order', 'promotion', 'system', 'alert'], default: 'system' },
    relatedId: { type: Schema.Types.ObjectId },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    deliveryMethod: [{ 
      type: String, 
      enum: ['push', 'email', 'sms'] 
    }],
    isScheduled: { type: Boolean, default: false },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
