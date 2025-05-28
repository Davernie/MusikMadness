import { Router } from 'express';
import { param } from 'express-validator';
import * as submissionController from '../controllers/submissionController';
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

// Add other submission-related routes here if necessary
// For example, to get submission details, update, delete, etc.

export default router; 