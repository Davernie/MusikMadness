import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { auth as authMiddleware } from '../middleware/auth.middleware';
import CreatorApplication from '../models/CreatorApplication';
import User from '../models/User';

const router = express.Router();

// @route   POST /api/creator/apply
// @desc    Submit creator application
// @access  Private
router.post('/apply', 
  authMiddleware,
  [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2-50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2-50 characters'),
    body('bio')
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage('Bio must be between 50-1000 characters'),
    body('experience')
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage('Experience description must be between 50-1000 characters'),
    body('musicGenres')
      .isArray({ min: 1, max: 10 })
      .withMessage('Please select 1-10 music genres'),
    body('reasonForApplying')
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage('Reason for applying must be between 50-1000 characters'),
    body('estimatedTournamentsPerMonth')
      .isInt({ min: 1, max: 20 })
      .withMessage('Please provide a realistic number of tournaments (1-20 per month)')
  ],
  async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user already has an application
    const existingApplication = await CreatorApplication.findOne({ user: req.user.userId });
    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already submitted a creator application',
        status: existingApplication.status,
        submittedAt: existingApplication.createdAt
      });
    }

    // Check if user is already a creator
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isCreator) {
      return res.status(400).json({ message: 'You are already a verified creator' });
    }

    const {
      displayName,
      bio,
      experience,
      musicGenres,
      musicLinks,
      reasonForApplying,
      pastTournaments,
      estimatedTournamentsPerMonth
    } = req.body;

    // Create new application
    const application = new CreatorApplication({
      user: req.user.userId,
      username: user.username,
      email: user.email,
      displayName: displayName.trim(),
      bio: bio.trim(),
      experience: experience.trim(),
      musicGenres,
      musicLinks: musicLinks || {},
      reasonForApplying: reasonForApplying.trim(),
      pastTournaments: pastTournaments?.trim() || '',
      estimatedTournamentsPerMonth: parseInt(estimatedTournamentsPerMonth)
    });

    await application.save();

    res.status(201).json({
      message: 'Creator application submitted successfully',
      applicationId: application._id,
      status: application.status
    });

  } catch (error) {
    console.error('Creator application error:', error);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
});

// @route   GET /api/creator/application/status
// @desc    Get current user's application status
// @access  Private
router.get('/application/status', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const application = await CreatorApplication.findOne({ user: req.user.userId });
    
    if (!application) {
      return res.status(404).json({ message: 'No application found' });
    }

    const response = {
      status: application.status,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      reviewNotes: application.reviewNotes
    };

    res.json(response);

  } catch (error) {
    console.error('Application status error:', error);
    res.status(500).json({ message: 'Server error while fetching application status' });
  }
});

// @route   GET /api/creator/check-eligibility
// @desc    Check if user can apply to become creator
// @access  Private
router.get('/check-eligibility', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a creator
    if (user.isCreator) {
      return res.json({
        canApply: false,
        reason: 'already_creator',
        message: 'You are already a verified creator'
      });
    }

    // Check if has pending/approved application
    const existingApplication = await CreatorApplication.findOne({ user: req.user.userId });
    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        return res.json({
          canApply: false,
          reason: 'pending_application',
          message: 'You have a pending creator application',
          submittedAt: existingApplication.createdAt
        });
      } else if (existingApplication.status === 'approved') {
        return res.json({
          canApply: false,
          reason: 'approved_pending_activation',
          message: 'Your application was approved but creator status is pending activation'
        });
      } else if (existingApplication.status === 'rejected') {
        const daysSinceRejection = Math.floor((Date.now() - existingApplication.reviewedAt!.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceRejection < 30) { // 30-day cooldown after rejection
          return res.json({
            canApply: false,
            reason: 'recently_rejected',
            message: `You can reapply ${30 - daysSinceRejection} days after your application was rejected`,
            rejectedAt: existingApplication.reviewedAt,
            canReapplyAt: new Date(existingApplication.reviewedAt!.getTime() + (30 * 24 * 60 * 60 * 1000))
          });
        }
      }
    }

    res.json({
      canApply: true,
      message: 'You are eligible to apply for creator status'
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Server error while checking eligibility' });
  }
});

// Admin routes (would typically be protected with admin middleware)
// @route   GET /api/creator/applications
// @desc    Get all creator applications (admin only)
// @access  Private/Admin
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    // TODO: Add admin middleware check here
    
    const { status, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      filter.status = status;
    }

    const applications = await CreatorApplication.find(filter)
      .populate('user', 'username email profilePicture')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await CreatorApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
});

export default router; 