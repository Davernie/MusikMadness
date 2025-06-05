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

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

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
      console.log(`[Auth Signup] Constructed profilePictureUrl: ${profilePictureUrl} (protocol: ${protocol}, host: ${host})`);
    }

    res.status(201).json({
      message: 'User registered successfully',
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