import express from 'express';
import { body } from 'express-validator';
import {
  createMatchups,
  getMatchupsByTournament,
  getMatchupById,
  voteOnMatchup,
  completeRound
} from '../controllers/matchup.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// @route   POST /api/matchups/tournaments/:tournamentId
// @desc    Create matchups for a tournament
// @access  Private
router.post('/tournaments/:tournamentId', auth, createMatchups);

// @route   GET /api/matchups/tournaments/:tournamentId
// @desc    Get all matchups for a tournament
// @access  Public
router.get('/tournaments/:tournamentId', getMatchupsByTournament);

// @route   GET /api/matchups/:id
// @desc    Get matchup by ID
// @access  Public
router.get('/:id', getMatchupById);

// @route   POST /api/matchups/:id/vote
// @desc    Vote on a matchup
// @access  Private
router.post(
  '/:id/vote',
  [
    auth,
    body('trackId')
      .notEmpty()
      .withMessage('Track ID is required')
  ],
  voteOnMatchup
);

// @route   POST /api/matchups/tournaments/:tournamentId/rounds/:round/complete
// @desc    Complete a round of matchups and generate next round
// @access  Private
router.post('/tournaments/:tournamentId/rounds/:round/complete', auth, completeRound);

export default router; 