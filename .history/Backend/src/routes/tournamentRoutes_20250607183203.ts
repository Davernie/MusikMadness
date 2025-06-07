import { Router } from 'express';
import { body, param } from 'express-validator'; // For validation
import * as tournamentController from '../controllers/tournamentController';
import { auth as authMiddleware } from '../middleware/auth.middleware'; // Renamed import
import upload from '../utils/imageUpload'; // Import upload middleware
import songUpload from '../utils/songUpload'; // Import legacy song upload middleware
import songUploadR2, { uploadSongToR2 } from '../utils/songUploadR2'; // Import R2 song upload middleware
import { isR2Configured } from '../config/r2'; // Import R2 configuration check

const router = Router();

// POST /api/tournaments - Create a new tournament
router.post(
  '/',
  authMiddleware, // Uncommented
  upload.single('tournamentCoverImage'), // Use multer for single file upload
  [
    body('title').notEmpty().withMessage('Tournament title is required').trim(),
    body('genre').notEmpty().withMessage('Genre is required').trim(),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('maxParticipants').isInt({ min: 2 }).withMessage('Max participants must be at least 2'),
    body('description').optional().trim(),
    body('rules').optional().isArray().withMessage('Rules must be an array')
      .custom((rulesArray) => { // Custom validator to check if all elements are strings
        if (rulesArray && !rulesArray.every((rule: any) => typeof rule === 'string')) {
          throw new Error('Each rule must be a string');
        }
        return true;
      }),
    body('language').optional().isString().trim().withMessage('Language must be a string')
    // Note: File validation (size, type) can be added here or in upload middleware config
  ],
  tournamentController.createTournament
);

// GET /api/tournaments - Get all tournaments (paginated, filter by status)
router.get('/', tournamentController.getAllTournaments);

// GET /api/tournaments/:id - Get a specific tournament by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid tournament ID')],
  tournamentController.getTournamentById
);

// GET /api/tournaments/:id/cover-image - Get a tournament's cover image
router.get(
  '/:id/cover-image',
  // No auth needed for public image access, add if image should be protected
  [param('id').isMongoId().withMessage('Invalid tournament ID')],
  tournamentController.getTournamentCoverImage
);

// PUT /api/tournaments/:id - Update a tournament
router.put(
  '/:id',
  authMiddleware, // Uncommented
  upload.single('tournamentCoverImage'), // Use multer for single file upload for updates
  [
    param('id').isMongoId().withMessage('Invalid tournament ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
    body('game').optional().notEmpty().withMessage('Game cannot be empty').trim(),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed']).withMessage('Invalid status'),
    body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format')
      .custom((value, { req }) => {
        const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
        // If only endDate is provided for update, we might not have req.body.startDate
        // This validation should ideally fetch the existing tournament's startDate if not changing it
        if (startDate && new Date(value) <= startDate) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('maxPlayers').optional().isInt({ min: 2 }).withMessage('Max players must be at least 2'),
    body('description').optional().trim(),
    body('removeCoverImage').optional().isBoolean().withMessage('removeCoverImage must be a boolean'),
    body('rules').optional().isArray().withMessage('Rules must be an array')
      .custom((rulesArray) => { // Custom validator for update
        if (rulesArray && !rulesArray.every((rule: any) => typeof rule === 'string')) {
          throw new Error('Each rule must be a string');
        }
        return true;
      }),
    body('language').optional().isString().trim().withMessage('Language must be a string')
  ],
  tournamentController.updateTournament
);

// POST /api/tournaments/:tournamentId/join - Join a tournament (submit a song)
// Dynamically choose upload method based on R2 configuration
const createJoinRoute = () => {
  const middleware = [
    authMiddleware,
    // Choose upload method based on R2 configuration
    ...(isR2Configured 
      ? [songUploadR2.single('songFile'), uploadSongToR2] 
      : [songUpload.single('songFile')]
    ),    [
      param('tournamentId').isMongoId().withMessage('Invalid tournament ID'),
      body('songTitle').notEmpty().withMessage('Song title is required').trim(),
      body('description').optional().trim(),
      body('streamingSource').optional().isIn(['upload', 'youtube', 'soundcloud']).withMessage('Invalid streaming source'),
      body('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
      body('soundcloudUrl').optional().isURL().withMessage('Invalid SoundCloud URL')
    ],
    tournamentController.joinTournament
  ];
  
  return middleware;
};

router.post(
  '/:tournamentId/join',
  ...createJoinRoute()
);

// POST /api/tournaments/:tournamentId/begin - Creator begins the tournament
router.post(
  '/:tournamentId/begin',
  authMiddleware,
  [param('tournamentId').isMongoId().withMessage('Invalid tournament ID')],
  tournamentController.beginTournament
);

// DELETE /api/tournaments/:id - Delete a tournament
router.delete(
  '/:id',
  authMiddleware, // Uncommented
  [param('id').isMongoId().withMessage('Invalid tournament ID')],
  tournamentController.deleteTournament
);

// GET /api/tournaments/:tournamentId/matchup/:matchupId - Get a specific matchup
router.get(
  '/:tournamentId/matchup/:matchupId',
  // authMiddleware, // Optional: Add if matchup details should be protected
  [
    param('tournamentId').isMongoId().withMessage('Invalid tournament ID'),
    param('matchupId').isString().withMessage('Invalid matchup ID format (should be string like R1M1)'), // Matchup ID is not a MongoID
  ],
  tournamentController.getMatchupById // We will create this controller function
);

// GET /api/tournaments/:tournamentId/matchup/:matchupId/stream-urls - Get fresh streaming URLs for matchup songs
router.get(
  '/:tournamentId/matchup/:matchupId/stream-urls',
  [
    param('tournamentId').isMongoId().withMessage('Invalid tournament ID'),
    param('matchupId').isString().withMessage('Invalid matchup ID format'),
  ],
  tournamentController.getMatchupStreamUrls // New controller function for streaming URLs
);

// POST /api/tournaments/:tournamentId/matchup/:matchupId/winner - Creator selects a winner for a matchup
router.post(
  '/:tournamentId/matchup/:matchupId/winner',
  authMiddleware, // Requires authentication
  [
    param('tournamentId').isMongoId().withMessage('Invalid tournament ID'),
    param('matchupId').isString().withMessage('Invalid matchup ID format'),
    body('winnerParticipantId').isMongoId().withMessage('Invalid winner participant ID')
  ],
  tournamentController.selectMatchupWinner // New controller function
);

export default router; 