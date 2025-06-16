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
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getStreamers);
router.get('/:id', getStreamer);

// Protected routes (authenticated users only for now)
router.post('/', auth, createStreamer);
router.put('/:id', auth, updateStreamer);
router.put('/:id/live-status', auth, updateLiveStatus);
router.put('/:id/toggle-active', auth, toggleActiveStatus);
router.delete('/:id', auth, deleteStreamer);

export default router;
