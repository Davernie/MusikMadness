import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User';
import emailService from '../services/emailService';
import { validatePassword, validateEmail } from '../utils/validation';

// MongoDB Flex Tier Connection Retry Utility for High-Load Scenarios
const withDatabaseRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // MongoDB-specific errors that warrant retry on Flex tier
      const isRetryableError = 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.name === 'MongoServerError' ||
        error.code === 11000 || // Duplicate key (can happen under high load)
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('pool');
      
      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter for Flex tier load balancing
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
      console.log(`🔄 Database retry attempt ${attempt}/${maxRetries} after ${delay}ms - Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Enhanced error response for production
const handleDatabaseError = (error: any, operation: string, res: Response) => {
  console.error(`❌ ${operation} error:`, error);
  
  // MongoDB-specific error handling for Flex tier
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation failed', 
      error: error.message 
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({ 
      message: 'Resource already exists', 
      error: 'Duplicate entry detected' 
    });
  }
  
  if (error.name === 'MongoNetworkError' || error.message?.includes('connection')) {
    return res.status(503).json({ 
      message: 'Database temporarily unavailable', 
      error: 'Please try again in a moment' 
    });
  }
  
  // Generic server error for production
  return res.status(500).json({ 
    message: `Server error during ${operation.toLowerCase()}`,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const TOKEN_EXPIRY = '7d';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // MongoDB-specific errors that warrant retry on Flex tier
      const isRetryableError = 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.name === 'MongoServerError' ||
        error.code === 11000 || // Duplicate key (can happen under high load)
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('pool');
      
      if (!isRetryableError || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter for Flex tier load balancing
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
      console.log(`🔄 Database retry attempt ${attempt}/${maxRetries} after ${delay}ms - Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Enhanced error response for production
const handleDatabaseError = (error: any, operation: string, res: Response) => {
  console.error(`❌ ${operation} error:`, error);
  
  // MongoDB-specific error handling for Flex tier
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation failed', 
      error: error.message 
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({ 
      message: 'Resource already exists', 
      error: 'Duplicate entry detected' 
    });
  }
  
  if (error.name === 'MongoNetworkError' || error.message?.includes('connection')) {
    return res.status(503).json({ 
      message: 'Database temporarily unavailable', 
      error: 'Please try again in a moment' 
    });
  }
  
  // Generic server error for production
  return res.status(500).json({ 
    message: `Server error during ${operation.toLowerCase()}`,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const TOKEN_EXPIRY = '7d';

// Register a new user
export const signup = async (req: Request, res: Response) => {  try {
    // Validate request and collect all validation errors
    const expressValidationErrors = validationResult(req);
    const fieldErrors: Record<string, string[]> = {};

    // Convert express-validator errors to fieldErrors format
    if (!expressValidationErrors.isEmpty()) {
      expressValidationErrors.array().forEach((error: any) => {
        const field = error.path || error.param;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.msg);
      });
    }

    const { username, email, password } = req.body;    // Additional custom validations (beyond express-validator)
    
    // Validate email format (additional check)
    if (!validateEmail(email)) {
      if (!fieldErrors.email) fieldErrors.email = [];
      fieldErrors.email.push('Please provide a valid email address');
    }

    // Validate password strength (additional check)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      if (!fieldErrors.password) fieldErrors.password = [];
      fieldErrors.password.push(...passwordValidation.errors);
    }    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        if (!fieldErrors.email) fieldErrors.email = [];
        fieldErrors.email.push('An account with this email already exists');
      }
      if (existingUser.username === username) {
        if (!fieldErrors.username) fieldErrors.username = [];
        fieldErrors.username.push('This username is already taken');
      }
    }

    // If there are validation errors, return them
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        fieldErrors
      });
    }

    // Generate email verification token
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hour expiry

    // Create new user
    const user = new User({
      username,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    await user.save();

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      email, 
      username, 
      emailVerificationToken
    );

    if (!emailSent) {
      console.log('⚠️  Failed to send verification email, but user was created');
    }

    // Generate JWT token (but mark as unverified)
    const token = jwt.sign(
      { 
        userId: user._id,
        isEmailVerified: false
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Construct profilePictureUrl
    let profilePictureUrl = null;
    if (user.profilePicture && user.profilePicture.data) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePictureUrl = `${protocol}://${host}/api/users/${user._id}/profile-picture`;
      console.log(`[Auth Signup] Constructed profilePictureUrl: ${profilePictureUrl} (protocol: ${protocol}, host: ${host})`);
    }

    res.status(201).json({
      message: emailSent ? 
        'User registered successfully. Please check your email to verify your account.' :
        'User registered successfully. Email verification temporarily unavailable.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: profilePictureUrl,
        bio: user.bio,
        isCreator: user.isCreator,
        isEmailVerified: user.isEmailVerified
      },
      requiresEmailVerification: !user.isEmailVerified
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(400).json({ 
        message: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - (user.loginAttempts + 1))
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Check email verification status
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in.',
        requiresEmailVerification: true
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        isEmailVerified: user.isEmailVerified
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Construct profilePictureUrl
    let profilePictureUrl = null;
    if (user.profilePicture && user.profilePicture.data) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePictureUrl = `${protocol}://${host}/api/users/${user._id}/profile-picture`;
      console.log(`[Auth Login] Constructed profilePictureUrl: ${profilePictureUrl} (protocol: ${protocol}, host: ${host})`);
    }

    // Log successful login
    console.log(`✅ Successful login: ${email} at ${new Date().toISOString()}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: profilePictureUrl,
        bio: user.bio,
        isCreator: user.isCreator,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Construct profilePictureUrl
    let profilePictureUrl = null;
    if (user.profilePicture && user.profilePicture.data) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePictureUrl = `${protocol}://${host}/api/users/${user._id}/profile-picture`;
      console.log(`[Auth Me] Constructed profilePictureUrl: ${profilePictureUrl} (protocol: ${protocol}, host: ${host})`);
    }

    // Construct coverImageUrl
    let coverImageUrl = null;
    if (user.coverImage && user.coverImage.data) { // Assuming 'coverImage' is the field in your User model
      const protocol = req.protocol;
      const host = req.get('host');
      coverImageUrl = `${protocol}://${host}/api/users/${user._id}/cover-image`; // Assuming this endpoint exists
      console.log(`[Auth Me] Constructed coverImageUrl: ${coverImageUrl} (protocol: ${protocol}, host: ${host})`);
    }

    // Send a structured user object including all necessary fields
    res.json({
      _id: user._id, // Frontend parseUserData expects _id for id mapping
      id: user._id, 
      username: user.username,
      email: user.email,
      profilePictureUrl: profilePictureUrl,
      coverImageUrl: coverImageUrl,
      bio: user.bio,
      location: user.location,
      genres: user.genres, 
      website: user.website,
      socials: user.socials,
      isCreator: user.isCreator
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email address
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    // Generate a new JWT token with verified status
    const jwtToken = jwt.sign(
      { 
        userId: user._id,
        isEmailVerified: true
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Construct profilePictureUrl
    let profilePictureUrl = null;
    if (user.profilePicture && user.profilePicture.data) {
      const protocol = req.protocol;
      const host = req.get('host');
      profilePictureUrl = `${protocol}://${host}/api/users/${user._id}/profile-picture`;
    }

    res.json({
      message: 'Email verified successfully! You are now logged in.',
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: profilePictureUrl,
        bio: user.bio,
        isCreator: user.isCreator,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email, newEmail } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Current email is required' });
    }

    // Find user by current email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    let targetEmail = email;
    
    // If user wants to change email
    if (newEmail && newEmail !== email) {
      // Validate new email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ 
          message: 'Please enter a valid email address',
          fieldErrors: { newEmail: ['Please enter a valid email address'] }
        });
      }

      // Check if new email is already taken by another user
      const existingUser = await User.findOne({ 
        email: newEmail, 
        _id: { $ne: user._id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'This email is already registered to another account',
          fieldErrors: { newEmail: ['This email is already registered to another account'] }
        });
      }

      // Update user's email
      user.email = newEmail;
      targetEmail = newEmail;
    }

    // Generate new verification token
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email to the target email
    const emailSent = await emailService.sendVerificationEmail(
      targetEmail,
      user.username,
      emailVerificationToken
    );

    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.' 
      });
    }

    res.json({
      message: newEmail && newEmail !== email 
        ? `Verification email sent to your new address: ${targetEmail}. Please check your inbox.`
        : 'Verification email sent successfully. Please check your inbox.',
      success: true,
      emailUpdated: newEmail && newEmail !== email
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ message: 'Server error while sending verification email' });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
        success: true
      });
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      user.username,
      passwordResetToken
    );

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email);
    }

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
      success: true
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Reset login attempts when password is changed
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({
      message: 'Password reset successful. You can now log in with your new password.',
      success: true
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};