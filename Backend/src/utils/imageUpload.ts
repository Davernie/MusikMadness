import multer from 'multer';
import path from 'path';

/**
 * Image Upload Configuration
 * 
 * Recommended dimensions:
 * - Profile Picture: 300x300 pixels (1:1 square aspect ratio)
 * - Cover Banner: 1400x400 pixels (3.5:1 aspect ratio)
 * 
 * Maximum file size: 5MB
 * Allowed formats: JPEG, JPG, PNG, WebP
 */

// Set storage engine for temporary file handling before storing in DB
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);  } else {
    cb(new Error('Error: Images Only! (jpeg, jpg, png, webp)'));
  }
};

// File size limits (5MB) and ideal dimensions info
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Extend Express Request to include our custom properties
declare global {
  namespace Express {
    interface Request {
      profileRecommendation?: string;
      coverRecommendation?: string;
    }
  }
}

// Multer filter that adds user-friendly recommendations
const multerFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type using our existing fileFilter logic
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (!mimetype || !extname) {
    return cb(new Error('Error: Images Only! (jpeg, jpg, png, webp)'));
  }
  
  // Add recommendations based on field name
  if (file.fieldname === 'profileImage') {
    // Add recommendation for profile pictures
    req.profileRecommendation = 'For best results, upload a square image (300x300 pixels). Maximum file size: 5MB.';
  } else if (file.fieldname === 'coverImage') {
    // Add recommendation for cover images
    req.coverRecommendation = 'For best results, upload a banner image (1400x400 pixels). Maximum file size: 5MB.';
  }
  
  return cb(null, true);
};

// Initialize upload middleware
const upload = multer({
  storage,
  fileFilter: multerFilter,
  limits
});

export default upload; 