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
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// File filter for songs (e.g., MP3, WAV)
const songFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']; // Add other audio types as needed
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, OGG files are allowed.'));
  }
};

// Multer instance for song uploads
const songUpload = multer({
  storage: songStorage,
  fileFilter: songFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit (adjust as needed)
  }
});

export default songUpload; 