import express from 'express';
import { body } from 'express-validator';
import {
  createTrack,
  getAllTracks,
  getTrackById,
  updateTrack,
  deleteTrack,
  getTrackStreamUrl
} from '../controllers/track.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// @route   POST /api/tracks
// @desc    Create a new track
// @access  Private
router.post(
  '/',
  [
    auth,
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot be more than 200 characters'),
    body('artist')
      .notEmpty()
      .withMessage('Artist is required')
      .isLength({ max: 200 })
      .withMessage('Artist cannot be more than 200 characters'),
    body('album')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Album cannot be more than 200 characters'),
    body('releaseYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Release year must be between 1900 and ${new Date().getFullYear()}`),
    body('spotifyId')
      .optional()
      .isString()
      .withMessage('Spotify ID must be a string'),
    body('youtubeId')
      .optional()
      .isString()
      .withMessage('YouTube ID must be a string'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Image URL must be a valid URL')
  ],
  createTrack
);

// @route   GET /api/tracks
// @desc    Get all tracks (paginated)
// @access  Public
router.get('/', getAllTracks);

// @route   GET /api/tracks/:id
// @desc    Get track by ID
// @access  Public
router.get('/:id', getTrackById);

// @route   PUT /api/tracks/:id
// @desc    Update track
// @access  Private
router.put(
  '/:id',
  [
    auth,
    body('title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Title cannot be more than 200 characters'),
    body('artist')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Artist cannot be more than 200 characters'),
    body('album')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Album cannot be more than 200 characters'),
    body('releaseYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Release year must be between 1900 and ${new Date().getFullYear()}`),
    body('spotifyId')
      .optional()
      .isString()
      .withMessage('Spotify ID must be a string'),
    body('youtubeId')
      .optional()
      .isString()
      .withMessage('YouTube ID must be a string'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Image URL must be a valid URL')
  ],
  updateTrack
);

// @route   DELETE /api/tracks/:id
// @desc    Delete track
// @access  Private
router.delete('/:id', auth, deleteTrack);

// Get track stream URL
router.get('/:id/stream', getTrackStreamUrl);

export default router;