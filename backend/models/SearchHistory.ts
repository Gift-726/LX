import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  query: string;
  createdAt: Date;
  updatedAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true }
  },
  { timestamps: true }
);

// Index for faster queries
searchHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
