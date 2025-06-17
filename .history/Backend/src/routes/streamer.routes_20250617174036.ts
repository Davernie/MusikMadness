import express from 'express';
import {
  getStreamers,
  getStreamer,
  createStreamer,
  updateStreamer,
  updateLiveStatus,
  deleteStreamer,
  toggleActiveStatus,
  updateAllStreamersStatus,
  updateStreamerStatus,
  linkUserToStreamer,
  unlinkUserFromStreamer
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
router.put('/:id/update-status', auth, updateStreamerStatus); // Auto-update single streamer
router.put('/update-all-status', auth, updateAllStreamersStatus); // Auto-update all streamers
router.delete('/:id', auth, deleteStreamer);

export default router;
