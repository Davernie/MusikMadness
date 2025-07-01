import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  getCurrentUser, 
  verifyEmail, 
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  googleLogin,
  completeGoogleSignup
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';
import { 
  authLimiter, 
  signupLimiter, 
  passwordResetLimiter,
  emailVerificationLimiter,
  speedLimiter,
  checkIPLockout
} from '../middleware/rateLimiting';
import upload from '../utils/imageUpload';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post(
  '/signup',
  signupLimiter, // Rate limit account creation
  speedLimiter,  // Slow down repeated requests
  upload.single('profileImage'), // Handle profile image upload
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
      .normalizeEmail({ gmail_remove_dots: false }),
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
  checkIPLockout,       // FIRST: Check if IP is temporarily blocked
  authLimiter,          // Rate limit login attempts (10 per IP per 15 min)
                        // No progressive delays - just immediate lockout after 8 attempts  speedLimiter,         // General speed limiting
  [
    body('emailOrUsername')
      .notEmpty()
      .withMessage('Email or username is required')
      .custom((value) => {
        // Allow either email format or username format
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value);
        if (!isEmail && !isUsername) {
          throw new Error('Please provide a valid email or username');
        }
        return true;
      }),
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
  emailVerificationLimiter,  // Strict email verification rate limiting
  [
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail({ gmail_remove_dots: false })
  ],
  resendVerificationEmail
);

// @route   POST /api/auth/request-password-reset
// @desc    Request password reset
// @access  Public
router.post(
  '/request-password-reset',  passwordResetLimiter, // Strict rate limiting for password resets
  [
    body('email')
      .isEmail()
      .withMessage('Please include a valid email')
      .normalizeEmail({ gmail_remove_dots: false })
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

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post(
  '/google',
  authLimiter,
  speedLimiter,
  [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required')
  ],
  googleLogin
);

// @route   POST /api/auth/google/complete-signup
// @desc    Complete Google OAuth registration with additional details
// @access  Public
router.post(
  '/google/complete-signup',
  authLimiter,
  speedLimiter,
  upload.single('profileImage'), // Handle profile image upload
  [
    body('tempToken')
      .notEmpty()
      .withMessage('Temporary token is required'),
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
  ],
  completeGoogleSignup
);

export default router;