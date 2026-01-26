import mongoose, { Document, Schema } from 'mongoose';

export type AllowedRole = 'user' | 'admin' | 'all';
export type RestrictionType = 'all' | 'users' | 'admins' | 'search_users' | 'search_admins';

export interface IPageRestriction extends Document {
  _id: mongoose.Types.ObjectId;
  pageName: string;
  allowedRoles: AllowedRole[];
  isRestricted: boolean;
  restrictionType: RestrictionType;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageRestrictionSchema = new Schema<IPageRestriction>(
  {
    pageName: { 
      type: String, 
      required: true, 
      unique: true 
    },
    allowedRoles: [{ 
      type: String, 
      enum: ['user', 'admin', 'all'] 
    }],
    isRestricted: { type: Boolean, default: false },
    restrictionType: { 
      type: String, 
      enum: ['all', 'users', 'admins', 'search_users', 'search_admins'], 
      default: 'all' 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IPageRestriction>('PageRestriction', pageRestrictionSchema);
