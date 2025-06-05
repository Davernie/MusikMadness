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

    const { username, email, password } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
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

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
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

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: profilePictureUrl,
        bio: user.bio,
        isCreator: user.isCreator
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