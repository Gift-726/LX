/**
 * Type utilities for Express Request with user
 */

import { IUser } from '../models/User';
import { Request } from 'express';

/**
 * Type guard to check if user exists on request
 */
export function hasUser(req: Request): req is Request & { user: IUser } {
  return req.user !== undefined;
}

/**
 * Get user from request with type safety
 */
export function getUser(req: Request): IUser {
  if (!req.user) {
    throw new Error('User not found on request');
  }
  return req.user;
}
