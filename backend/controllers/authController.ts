/**
 * Authentication Controller
 * Handles user registration, login, password reset, and 2FA verification
 */

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationCode } from '../config/email';

interface RegisterRequestBody {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface VerifyRequestBody {
  email: string;
  code: string;
}

interface ResetPasswordRequestBody {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface JwtPayload {
  id: string;
}

/* ============================================================
   REGISTER USER
============================================================ */
const registerUser = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  try {
    const { firstname, lastname, email, phone, password, confirmPassword } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
      return;
    }

    // Check duplicates
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email already exists',
        field: 'email'
      });
      return;
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      res.status(400).json({
        success: false,
        message: 'Phone number already exists',
        field: 'phone'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email is admin email
    const isAdmin = email.toLowerCase() === 'gianosamsung@gmail.com';

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user',
      isVerified: false,
      verificationCode,
      verificationCodeExpiry
    });

    // Send verification code via email (registration type)
    const emailResult = await sendVerificationCode(email, verificationCode, 'registration');

    if (!emailResult.success) {
      // Delete the user if email fails
      await User.findByIdAndDelete(newUser._id);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: emailResult.error
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for the verification code.',
      userId: newUser._id.toString(),
      email: newUser.email,
      expiresIn: '10 minutes',
      previewUrl: emailResult.previewUrl,
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


/* ============================================================
   LOGIN USER (WITH ENHANCED VALIDATION)
============================================================ */
const loginUser = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.',
        redirectTo: 'signup'
      });
      return;
    }

    // Check if user registered via OAuth (no password)
    if (!user.password) {
      res.status(400).json({
        success: false,
        message: 'This account was created using social login. Please use Google or Facebook to sign in.',
        socialLogin: true
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if user has verified their email (for non-OAuth users)
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the verification code.',
        requiresVerification: true,
        email: user.email
      });
      return;
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code to user
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send verification code via email (login type)
    const emailResult = await sendVerificationCode(email, verificationCode, 'login');

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: emailResult.error
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email. Please verify to complete login.',
      userId: user._id.toString(),
      email: user.email,
      expiresIn: '10 minutes',
      previewUrl: emailResult.previewUrl,
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


/* ============================================================
   FORGOT PASSWORD - SEND VERIFICATION CODE
============================================================ */
const forgotPassword = async (req: Request<{}, {}, { email: string }>, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        redirectTo: 'signup'
      });
      return;
    }

    // Check if user registered via OAuth (no password to reset)
    if (!user.password) {
      res.status(400).json({
        success: false,
        message: 'This account was created using social login. Password reset is not available.',
        socialLogin: true
      });
      return;
    }

    // Generate 4-digit code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (10 minutes from now)
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save code to database
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send email (password-reset type)
    const emailResult = await sendVerificationCode(email, resetCode, 'password-reset');

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: emailResult.error
      });
      return;
    }

    res.json({
      success: true,
      message: emailResult.isFallback
        ? 'Verification code sent (using backup email service). See preview link.'
        : 'Verification code sent to your email',
      expiresIn: '10 minutes',
      previewUrl: emailResult.previewUrl,
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


/* ============================================================
   VERIFY RESET CODE
============================================================ */
const verifyResetCode = async (req: Request<{}, {}, VerifyRequestBody>, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if code exists
    if (!user.resetCode) {
      res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
      return;
    }

    // Check if code has expired
    if (user.resetCodeExpiry && new Date() > user.resetCodeExpiry) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        expired: true
      });
      return;
    }

    // Verify code
    if (user.resetCode !== code) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code is valid. You can now reset your password.'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


/* ============================================================
   RESET PASSWORD
============================================================ */
const resetPassword = async (req: Request<{}, {}, ResetPasswordRequestBody>, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if code exists
    if (!user.resetCode) {
      res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
      return;
    }

    // Check if code has expired
    if (user.resetCodeExpiry && new Date() > user.resetCodeExpiry) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        expired: true
      });
      return;
    }

    // Verify code
    if (user.resetCode !== code) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


/* ============================================================
   VERIFY REGISTRATION CODE (2FA)
============================================================ */
const verifyRegistration = async (req: Request<{}, {}, VerifyRequestBody>, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Account already verified. Please login.'
      });
      return;
    }

    // Check if code exists
    if (!user.verificationCode) {
      res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
      return;
    }

    // Check if code has expired
    if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please register again.',
        expired: true
      });
      return;
    }

    // Verify code
    if (user.verificationCode !== code) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    // Mark user as verified and clear verification code
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Registration completed successfully!',
      token,
      user: {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verify registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


/* ============================================================
   VERIFY LOGIN CODE (2FA)
============================================================ */
const verifyLogin = async (req: Request<{}, {}, VerifyRequestBody>, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Please complete registration verification first.'
      });
      return;
    }

    // Check if code exists
    if (!user.verificationCode) {
      res.status(400).json({
        success: false,
        message: 'No verification code found. Please login again.'
      });
      return;
    }

    // Check if code has expired
    if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please login again.',
        expired: true
      });
      return;
    }

    // Verify code
    if (user.verificationCode !== code) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    // Clear verification code
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verify login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};


export {
  registerUser,
  loginUser,
  verifyRegistration,
  verifyLogin,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
