import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: mongoose.Types.ObjectId;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    icon: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
