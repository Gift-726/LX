/**
 * Model type definitions
 * These will be populated as we convert models to TypeScript
 */

import { Document, Types } from 'mongoose';

// Base document interface
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// This file will be expanded as we convert models
// For now, it serves as a placeholder for model type definitions
