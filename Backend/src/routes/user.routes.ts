import express from 'express';
import { body } from 'express-validator';
import { 
  getUserProfile, 
  updateProfile, 
  getAllUsers,
  uploadProfilePicture,
  uploadCoverImage,
  getProfilePicture,
  getCoverImage
} from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';
import upload from '../utils/imageUpload';
import User from '../models/User';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (paginated)
// @access  Public
router.get('/', getAllUsers);

// @route   GET /api/users/debug/image-info/:id
// @desc    Debug endpoint to check image data
// @access  Public
router.get('/debug/image-info/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const imageInfo = {
      hasProfilePicture: !!user.profilePicture,
      profilePictureContentType: user.profilePicture?.contentType,
      profilePictureDataLength: user.profilePicture?.data?.length,
      hasCoverImage: !!user.coverImage,
      coverImageContentType: user.coverImage?.contentType,
      coverImageDataLength: user.coverImage?.data?.length
    };
    
    res.json(imageInfo);
  } catch (error) {
    console.error('Debug image info error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio cannot be more than 500 characters'),
    body('location')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Location must be a string with max 100 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('genres')
      .optional()
      .isArray()
      .withMessage('Genres must be an array'),
    body('genres.*')
      .optional()
      .isString()
      .withMessage('Each genre must be a string'),
    body('socials.soundcloud')
      .optional()
      .isString()
      .withMessage('Soundcloud handle must be a string'),
    body('socials.instagram')
      .optional()
      .isString()
      .withMessage('Instagram handle must be a string'),
    body('socials.twitter')
      .optional()
      .isString()
      .withMessage('Twitter handle must be a string'),
    body('socials.spotify')
      .optional()
      .isString()
      .withMessage('Spotify handle must be a string')
  ],
  updateProfile
);

// @route   POST /api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post(
  '/profile-picture',
  auth,
  upload.single('profileImage'),
  uploadProfilePicture
);

// @route   POST /api/users/cover-image
// @desc    Upload cover image
// @access  Private
router.post(
  '/cover-image',
  auth,
  upload.single('coverImage'),
  uploadCoverImage
);

// @route   GET /api/users/:id/profile-picture
// @desc    Get user profile picture
// @access  Public
router.get(
  '/:id/profile-picture',
  getProfilePicture
);

// @route   GET /api/users/:id/cover-image
// @desc    Get user cover image
// @access  Public
router.get(
  '/:id/cover-image',
  getCoverImage
);

// @route   GET /api/users/raw-image/:id
// @desc    Debug endpoint to get raw image data as base64 string
// @access  Public
router.get('/raw-image/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ message: 'User or profile picture not found' });
    }
    
    // Get the raw binary data
    const rawData = user.profilePicture.data;
    
    console.log('Raw data type:', typeof rawData, rawData.constructor.name);
    
    // Create a base64 string
    let base64String;
    
    if (rawData instanceof Buffer) {
      base64String = rawData.toString('base64');
    } else if (typeof rawData === 'object' && rawData.buffer) {
      // Handle Binary object from MongoDB
      base64String = Buffer.from(rawData.buffer).toString('base64');
    } else {
      // Try to convert whatever we have to a Buffer
      base64String = Buffer.from(rawData).toString('base64');
    }
    
    // Display in an HTML page for debugging
    const contentType = user.profilePicture.contentType || 'image/png';
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Image Debug</title>
      </head>
      <body>
        <h1>Image Debug</h1>
        <p>Content Type: ${contentType}</p>
        <p>Data Type: ${typeof rawData} (${rawData.constructor.name})</p>
        <p>Data Length: ${rawData.length || 'unknown'}</p>
        <h2>Image Display:</h2>
        <img src="data:${contentType};base64,${base64String}" alt="User image" style="max-width: 500px;">
        <h2>Base64 String (first 100 chars):</h2>
        <pre>${base64String.substring(0, 100)}...</pre>
      </body>
      </html>
    `;
    
    res.set('Content-Type', 'text/html');
    res.send(htmlResponse);
  } catch (error) {
    console.error('Raw image debug error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router; 