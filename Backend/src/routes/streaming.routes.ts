import express from 'express';
import { body } from 'express-validator';
import { 
  getAllStreamers,
  updateStreamingSettings,
  updateLiveStatus,
  updateViewerCount,
  getStreamingStats
} from '../controllers/streaming.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// @route   GET /api/streaming/streamers
// @desc    Get all streamers (optionally filter by live status)
// @access  Public
router.get('/streamers', getAllStreamers);

// @route   GET /api/streaming/stats
// @desc    Get streaming statistics
// @access  Public
router.get('/stats', getStreamingStats);

// @route   PUT /api/streaming/settings
// @desc    Update streaming settings for authenticated user
// @access  Private
router.put(
  '/settings',
  [
    auth,
    body('isStreamer')
      .optional()
      .isBoolean()
      .withMessage('isStreamer must be a boolean'),
    body('streamTitle')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Stream title cannot exceed 200 characters'),
    body('streamDescription')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Stream description cannot exceed 500 characters'),
    body('preferredPlatform')
      .optional()
      .isIn(['twitch', 'youtube', 'kick'])
      .withMessage('Platform must be twitch, youtube, or kick'),
    body('thumbnailUrl')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL'),
    body('streamingSchedule')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Streaming schedule cannot exceed 300 characters'),
    body('streamCategories')
      .optional()
      .isArray()
      .withMessage('Stream categories must be an array'),
    body('streamCategories.*')
      .optional()
      .isString()
      .withMessage('Each category must be a string')
  ],
  updateStreamingSettings
);

// @route   PUT /api/streaming/live-status
// @desc    Update live status (go live/offline)
// @access  Private
router.put(
  '/live-status',
  [
    auth,
    body('isLive')
      .isBoolean()
      .withMessage('isLive must be a boolean'),
    body('streamTitle')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Stream title cannot exceed 200 characters'),
    body('viewerCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Viewer count must be a non-negative integer')
  ],
  updateLiveStatus
);

// @route   PUT /api/streaming/viewer-count
// @desc    Update viewer count
// @access  Private
router.put(
  '/viewer-count',
  [
    auth,
    body('viewerCount')
      .isInt({ min: 0 })
      .withMessage('Viewer count must be a non-negative integer')
  ],
  updateViewerCount
);

export default router; 