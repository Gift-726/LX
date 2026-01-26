/**
 * Express type extensions
 * Extends Express Request interface to include user object
 */

import { IUser } from '../models/User';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        _id: mongoose.Types.ObjectId;
        role: 'user' | 'admin';
      };
    }
  }
}
