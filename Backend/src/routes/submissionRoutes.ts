import { Router } from 'express';
import { param } from 'express-validator';
import * as submissionController from '../controllers/submissionController';
import { auth as authMiddleware } from '../middleware/auth.middleware';
// import { auth as authMiddleware } from '../middleware/auth.middleware'; // If needed for any routes

const router = Router();

// GET /api/submissions/:submissionId/file - Get a specific submission audio file
router.get(
  '/:submissionId/file',
  [
    param('submissionId').isMongoId().withMessage('Invalid submission ID')
  ],
  submissionController.getSubmissionFile
);

// GET /api/submissions/:submissionId/stream-url - Get presigned/direct URLs for streaming
router.get(
  '/:submissionId/stream-url',
  [
    param('submissionId').isMongoId().withMessage('Invalid submission ID')
  ],
  submissionController.getSubmissionStreamUrl
);

// POST /api/submissions/:submissionId/migrate-r2 - Migrate legacy submission to R2 (admin only)
router.post(
  '/:submissionId/migrate-r2',
  authMiddleware,
  [
    param('submissionId').isMongoId().withMessage('Invalid submission ID')
  ],
  submissionController.migrateSubmissionToR2
);

// Add other submission-related routes here if necessary
// For example, to get submission details, update, delete, etc.

export default router; 