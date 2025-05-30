import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the storage directory for songs
const songStorageDir = path.join(__dirname, '../../uploads/songs');

// Ensure the storage directory exists
if (!fs.existsSync(songStorageDir)) {
  fs.mkdirSync(songStorageDir, { recursive: true });
}

// Configure storage for songs
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, songStorageDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp-tournamentId-userId-originalfilename
    const tournamentId = req.params.tournamentId || 'unknownTournament';
    const userId = req.user?.userId || 'unknownUser';
    const uniqueSuffix = `${Date.now()}-${tournamentId}-${userId}`;
    const extension = path.extname(file.originalname);
    const sanitizedOriginalName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}${extension}`);
  }
});

// File filter for songs (updated to match R2 upload)
const songFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac', 'audio/aac'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, OGG, FLAC, AAC files are allowed.'));
  }
};

// Multer instance for song uploads (increased limit to match R2)
const songUpload = multer({
  storage: songStorage,
  fileFilter: songFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit (match R2 upload)
  }
});

export default songUpload; 