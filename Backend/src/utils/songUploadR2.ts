import multer from 'multer';
import { R2Service } from '../services/r2Service';
import { isR2Configured } from '../config/r2';

// File filter for songs (e.g., MP3, WAV)
const songFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac', 'audio/aac'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, OGG, FLAC, AAC files are allowed.'));
  }
};

// Use memory storage since we'll upload directly to R2
const songUploadR2 = multer({
  storage: multer.memoryStorage(),
  fileFilter: songFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit (increase for better quality audio)
  }
});

// Middleware to handle R2 upload after multer processes the file
export const uploadSongToR2 = async (req: any, res: any, next: any) => {
  try {
    if (!req.file) {
      return next();
    }

    // Check if R2 is configured
    if (!isR2Configured) {
      console.warn('R2 not configured - skipping R2 upload');
      return next(); // Continue without R2 upload, let the controller handle fallback
    }

    const tournamentId = req.params.tournamentId || 'unknown';
    const userId = req.user?.userId || 'unknown';

    // Upload to R2
    const { url, key } = await R2Service.uploadSong(
      req.file.buffer,
      tournamentId,
      userId,
      req.file.originalname,
      req.file.mimetype,
      {
        songTitle: req.body.songTitle || 'Unknown Title',
        description: req.body.description || '',
      }
    );

    // Add R2 information to request for use in the controller
    req.r2Upload = {
      url,
      key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    next();
  } catch (error) {
    console.error('Error uploading song to R2:', error);
    
    // If R2 upload fails, continue without it (fallback to local storage)
    console.warn('R2 upload failed, continuing without R2 upload');
    return next();
  }
};

export default songUploadR2; 