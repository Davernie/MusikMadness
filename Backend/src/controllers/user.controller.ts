import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password -profilePicture.data -coverImage.data');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format response to include image URLs with full URL
    const userData = user.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    userData.profilePictureUrl = user.profilePicture?.contentType ? 
      `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
    userData.coverImageUrl = user.coverImage?.contentType ? 
      `${baseUrl}/api/users/${user._id}/cover-image` : undefined;
    
    res.json(userData);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user?.userId;    const { 
      username, 
      firstName,
      lastName,
      bio, 
      location,
      website,
      genres,
      socials
    } = req.body;
    
    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }
      // Update user profile
    const updateData: { [key: string]: any } = {};
    if (username) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (genres && Array.isArray(genres)) updateData.genres = genres;
      // Handle social media links
    if (socials && typeof socials === 'object') {
      updateData.socials = {};
      if (socials.soundcloud !== undefined) updateData.socials.soundcloud = socials.soundcloud;
      if (socials.instagram !== undefined) updateData.socials.instagram = socials.instagram;
      if (socials.twitter !== undefined) updateData.socials.twitter = socials.twitter;
      if (socials.spotify !== undefined) updateData.socials.spotify = socials.spotify;
      if (socials.youtube !== undefined) updateData.socials.youtube = socials.youtube;
      if (socials.twitch !== undefined) updateData.socials.twitch = socials.twitch;
      if (socials.kick !== undefined) updateData.socials.kick = socials.kick;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password -profilePicture.data -coverImage.data');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format response with full URLs
    const userData = user.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    userData.profilePictureUrl = user.profilePicture?.contentType ? 
      `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
    userData.coverImageUrl = user.coverImage?.contentType ? 
      `${baseUrl}/api/users/${user._id}/cover-image` : undefined;
    
    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (paginated)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password -profilePicture.data -coverImage.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    
    // Format users to include image URLs with full paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedUsers = users.map(user => {
      const userData = user.toObject();
      userData.profilePictureUrl = user.profilePicture?.contentType ? 
        `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
      userData.coverImageUrl = user.coverImage?.contentType ? 
        `${baseUrl}/api/users/${user._id}/cover-image` : undefined;
      return userData;
    });
    
    res.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file provided',
        recommendation: 'Please upload a profile image with dimensions of 300x300 pixels (1:1 aspect ratio) for best results. Maximum file size: 5MB.'
      });
    }
    
    console.log("Received file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `Buffer (${req.file.buffer.length} bytes)` : 'No buffer'
    });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store image in DB
    user.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    
    await user.save();
    
    const absoluteProfilePictureUrl = `${req.protocol}://${req.get('host')}/api/users/${user._id}/profile-picture`;

    console.log("Saved profile picture:", {
      userId,
      contentType: user.profilePicture.contentType,
      dataSize: user.profilePicture.data.length,
      profilePictureUrl: absoluteProfilePictureUrl
    });
    
    res.json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: absoluteProfilePictureUrl,
      recommendation: 'For best display results, profile pictures should be 300x300 pixels (square). Maximum file size: 5MB.'
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload cover image
export const uploadCoverImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file provided',
        recommendation: 'Please upload a cover banner with dimensions of 1400x400 pixels (3.5:1 aspect ratio) for best results. Maximum file size: 5MB.'
      });
    }
    
    console.log("Received cover image:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `Buffer (${req.file.buffer.length} bytes)` : 'No buffer'
    });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store image in DB
    user.coverImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    
    await user.save();
    
    const absoluteCoverImageUrl = `${req.protocol}://${req.get('host')}/api/users/${user._id}/cover-image`;

    console.log("Saved cover image:", {
      userId,
      contentType: user.coverImage.contentType,
      dataSize: user.coverImage.data.length,
      coverImageUrl: absoluteCoverImageUrl
    });
    
    res.json({
      message: 'Cover image uploaded successfully',
      coverImageUrl: absoluteCoverImageUrl,
      recommendation: 'For best display results, cover banners should be 1400x400 pixels (3.5:1 ratio). Maximum file size: 5MB.'
    });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile picture
export const getProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }
    
    if (!user.profilePicture.data || !user.profilePicture.contentType) {
      return res.status(404).json({ message: 'Profile picture data is incomplete' });
    }
    
    // Display debug info
    console.log("Profile Picture Info:", {
      userId,
      contentType: user.profilePicture.contentType,
      data: user.profilePicture.data ? 
        `Binary data of type ${user.profilePicture.data.constructor.name}, length: ${user.profilePicture.data.length || 0}` : 'No data'
    });
    
    // Ensure we have valid binary data
    let imageData = user.profilePicture.data;
    
    // Convert MongoDB Binary object to Buffer if needed
    if (typeof imageData === 'object' && imageData.buffer) {
      imageData = Buffer.from(imageData.buffer);
      console.log('Converted Binary to Buffer. New length:', imageData.length);
    } else if (!(imageData instanceof Buffer)) {
      // Make sure we always have a Buffer
      imageData = Buffer.from(imageData);
      console.log('Converted data to Buffer. New length:', imageData.length);
    }
    
    // Set headers and send the image data
    res.set('Content-Type', user.profilePicture.contentType);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.send(imageData);
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// Get user cover image
export const getCoverImage = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user || !user.coverImage) {
      return res.status(404).json({ message: 'Cover image not found' });
    }
    
    if (!user.coverImage.data || !user.coverImage.contentType) {
      return res.status(404).json({ message: 'Cover image data is incomplete' });
    }
    
    // Display debug info
    console.log("Cover Image Info:", {
      userId,
      contentType: user.coverImage.contentType,
      data: user.coverImage.data ? 
        `Binary data of type ${user.coverImage.data.constructor.name}, length: ${user.coverImage.data.length || 0}` : 'No data'
    });
    
    // Ensure we have valid binary data
    let imageData = user.coverImage.data;
    
    // Convert MongoDB Binary object to Buffer if needed
    if (typeof imageData === 'object' && imageData.buffer) {
      imageData = Buffer.from(imageData.buffer);
      console.log('Converted Binary to Buffer. New length:', imageData.length);
    } else if (!(imageData instanceof Buffer)) {
      // Make sure we always have a Buffer
      imageData = Buffer.from(imageData);
      console.log('Converted data to Buffer. New length:', imageData.length);
    }
    
    // Set headers and send the image data
    res.set('Content-Type', user.coverImage.contentType);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.send(imageData);
  } catch (error) {
    console.error('Get cover image error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// Get users with streaming platform social links
export const getStreamingUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Find users who have streaming platform social links
    const query = {
      $or: [
        { 'socials.youtube': { $exists: true, $ne: '' } },
        { 'socials.soundcloud': { $exists: true, $ne: '' } },
        { 'socials.instagram': { $exists: true, $ne: '' } },
        { 'socials.twitter': { $exists: true, $ne: '' } }
      ]
    };
    
    const users = await User.find(query)
      .select('-password -profilePicture.data -coverImage.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    // Format users to include image URLs with full paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedUsers = users.map(user => {
      const userData = user.toObject();
      userData.profilePictureUrl = user.profilePicture?.contentType ? 
        `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
      userData.coverImageUrl = user.coverImage?.contentType ? 
        `${baseUrl}/api/users/${user._id}/cover-image` : undefined;
      return userData;
    });
    
    res.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get streaming users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 