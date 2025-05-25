import express from 'express';
import { body } from 'express-validator';
import { 
  createTournament, 
  getAllTournaments, 
  getTournamentById, 
  updateTournament, 
  deleteTournament,
  addTracksToTournament
} from '../controllers/tournament.controller';
import { auth } from '../middleware/auth.middleware';
import { isCreator } from '../middleware/creator.middleware';

const router = express.Router();

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private (Creator Only)
router.post(
  '/',
  [
    auth,
    isCreator,
    body('name')
      .notEmpty()
      .withMessage('Tournament name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Tournament name must be between 3 and 100 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('rounds')
      .notEmpty()
      .withMessage('Number of rounds is required')
      .isInt({ min: 1 })
      .withMessage('Rounds must be a positive integer')
  ],
  createTournament
);

// @route   GET /api/tournaments
// @desc    Get all tournaments (paginated)
// @access  Public
router.get('/', getAllTournaments);

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', getTournamentById);

// @route   PUT /api/tournaments/:id
// @desc    Update tournament
// @access  Private
router.put(
  '/:id',
  [
    auth,
    body('name')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Tournament name must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'completed'])
      .withMessage('Status must be draft, active, or completed'),
    body('rounds')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Rounds must be a positive integer')
  ],
  updateTournament
);

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament
// @access  Private
router.delete('/:id', auth, deleteTournament);

// @route   POST /api/tournaments/:id/tracks
// @desc    Add tracks to tournament
// @access  Private
router.post(
  '/:id/tracks',
  [
    auth,
    body('trackIds')
      .isArray()
      .withMessage('Track IDs must be an array')
      .notEmpty()
      .withMessage('At least one track ID is required')
  ],
  addTracksToTournament
);

export default router; 