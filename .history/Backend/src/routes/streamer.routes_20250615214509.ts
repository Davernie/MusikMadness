import express from 'express';
import {
  getStreamers,
  getStreamer,
  createStreamer,
  updateStreamer,
  updateLiveStatus,
  deleteStreamer,
  toggleActiveStatus
} from '../controllers/streamer.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Public routes
router.get('/', getStreamers);
router.get('/:id', getStreamer);

// Protected routes (admin only)
router.post('/', authenticateToken, requireRole(['admin']), createStreamer);
router.put('/:id', authenticateToken, requireRole(['admin']), updateStreamer);
router.put('/:id/live-status', authenticateToken, requireRole(['admin']), updateLiveStatus);
router.put('/:id/toggle-active', authenticateToken, requireRole(['admin']), toggleActiveStatus);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteStreamer);

export default router;
