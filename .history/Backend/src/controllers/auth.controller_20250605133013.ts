import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User';
import emailService from '../services/emailService';
import { validatePassword, validateEmail } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const TOKEN_EXPIRY = '7d';

// Register a new user
export const signup = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;    // Collect validation errors
    const fieldErrors: Record<string, string[]> = {};

    // Validate email format
    if (!validateEmail(email)) {
      fieldErrors.email = ['Please provide a valid email address'];
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      fieldErrors.password = passwordValidation.errors;
    }

    // Validate username (basic validation)
    if (!username || username.trim().length < 3) {
      fieldErrors.username = ['Username must be at least 3 characters long'];
    } else if (username.length > 30) {
      fieldErrors.username = ['Username must be no more than 30 characters long'];
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      fieldErrors.username = ['Username can only contain letters, numbers, hyphens, and underscores'];
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        fieldErrors.email = fieldErrors.email || [];
        fieldErrors.email.push('An account with this email already exists');
      }
      if (existingUser.username === username) {
        fieldErrors.username = fieldErrors.username || [];
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      email,
      user.username,
      emailVerificationToken
    );

    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.' 
      });
    }

    res.json({
      message: 'Verification email sent successfully. Please check your inbox.',
      success: true
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