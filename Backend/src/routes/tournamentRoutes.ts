import { Router } from 'express';
import { body, param } from 'express-validator'; // For validation
import * as tournamentController from '../controllers/TournamentController';
import { auth as authMiddleware } from '../middleware/auth.middleware'; // Renamed import
import upload from '../utils/imageUpload'; // Import upload middleware
import songUpload from '../utils/songUpload'; // Import song upload middleware

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
router.post(
  '/:tournamentId/join',
  authMiddleware,
  songUpload.single('songFile'), // Use songUpload middleware for a single song file
  [
    param('tournamentId').isMongoId().withMessage('Invalid tournament ID'),
    body('songTitle').notEmpty().withMessage('Song title is required').trim(),
    body('description').optional().trim()
    // Add more validation as needed for other fields if any
  ],
  tournamentController.joinTournament // New controller function
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

export default router; 