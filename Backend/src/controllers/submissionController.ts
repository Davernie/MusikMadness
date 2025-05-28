import { Request, Response } from 'express';
import Submission from '../models/Submission'; // Assuming your Submission model is in ../models
import fs from 'fs';
import path from 'path';

declare global {
    namespace Express {
      interface Request {
        user?: { userId: string; isCreator?: boolean; }; 
      }
    }
  }

export const getSubmissionFile = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);

    if (!submission || !submission.songFilePath) {
      return res.status(404).json({ message: 'Submission file not found.' });
    }

    const filePath = path.resolve(submission.songFilePath); // Resolve to an absolute path

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error('File does not exist at path:', filePath);
        return res.status(404).json({ message: 'Submission file not found on server.' });
    }

    // Set appropriate headers
    res.set('Content-Type', submission.mimetype || 'audio/mpeg'); // Fallback mimetype
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year, or adjust as needed
    // Consider adding Content-Disposition if you want to force download with original name:
    // res.set('Content-Disposition', `attachment; filename="${submission.originalFileName || 'track.mp3'}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        // Don't try to send another response if headers already sent
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error streaming submission file.' });
        }
    });

  } catch (error) {
    console.error('Error fetching submission file:', error);
    if (error instanceof Error && (error as any).kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid submission ID format.' });
    }
    if (!res.headersSent) {
        res.status(500).json({ message: 'Server error while fetching submission file.' });
    }
  }
};

// Add other submission controller functions as needed (e.g., create, update, delete, get details) 