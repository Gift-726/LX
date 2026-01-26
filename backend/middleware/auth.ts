/**
 * Authentication Middleware
 * Handles JWT token verification and admin authorization
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

/* ============================================================
   PROTECT MIDDLEWARE - Verify JWT Token
============================================================ */
const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
      return;
    }

    try {
      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Type guard to ensure user is not null
      if (!user._id) {
        res.status(401).json({
          success: false,
          message: 'Invalid user data'
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* ============================================================
   ADMIN MIDDLEWARE - Verify User is Admin
============================================================ */
const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

export { protect, admin };
