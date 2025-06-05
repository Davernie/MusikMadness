import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  getCurrentUser, 
  verifyEmail, 
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';
import { 
  authLimiter, 
  signupLimiter, 
  passwordResetLimiter,
  speedLimiter
} from '../middleware/rateLimiting';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post(
  '/signup',
  signupLimiter, // Rate limit account creation
  speedLimiter,  // Slow down repeated requests
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  signup
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  authLimiter,   // Rate limit login attempts
  speedLimiter,  // Slow down repeated requests
  [
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Password is required')
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post(
  '/verify-email',
  authLimiter,
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  verifyEmail
);

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post(
  '/resend-verification',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail()
  ],
  resendVerificationEmail
);

// @route   POST /api/auth/request-password-reset
// @desc    Request password reset
// @access  Public
router.post(
  '/request-password-reset',
  passwordResetLimiter, // Strict rate limiting for password resets
  [
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail()
  ],
  requestPasswordReset
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  authLimiter,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  resetPassword
);

export default router; 