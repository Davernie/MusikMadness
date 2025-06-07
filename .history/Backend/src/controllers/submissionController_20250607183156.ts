import { Request, Response } from 'express';
import Submission from '../models/Submission'; // Assuming your Submission model is in ../models
import { R2Service } from '../services/r2Service';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { getSoundCloudEmbedUrl } from '../utils/soundcloud';
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

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    // Handle YouTube submissions
    if (submission.streamingSource === 'youtube') {
      if (!submission.youtubeVideoId) {
        return res.status(404).json({ message: 'YouTube video ID not found.' });
      }
      
      // Return YouTube metadata and streaming URLs
      return res.json({
        type: 'youtube',
        videoId: submission.youtubeVideoId,
        originalUrl: submission.youtubeUrl,
        embedUrl: getYouTubeEmbedUrl(submission.youtubeVideoId),
        thumbnail: submission.youtubeThumbnail,
        duration: submission.youtubeDuration,
        title: submission.songTitle
      });
    }

    // Handle SoundCloud submissions
    if (submission.streamingSource === 'soundcloud') {
      if (!submission.soundcloudUrl) {
        return res.status(404).json({ message: 'SoundCloud URL not found.' });
      }
      
      // Return SoundCloud metadata and streaming URLs
      return res.json({
        type: 'soundcloud',
        trackId: submission.soundcloudTrackId,
        originalUrl: submission.soundcloudUrl,
        embedUrl: getSoundCloudEmbedUrl(submission.soundcloudUrl),
        artwork: submission.soundcloudArtwork,
        duration: submission.soundcloudDuration,
        username: submission.soundcloudUsername,
        title: submission.songTitle
      });
    }
    if (submission.r2Key && submission.r2Url) {
      try {
        // Option 1: Redirect to R2 public URL (fastest, uses R2's CDN)
        // return res.redirect(302, submission.r2Url);

        // Option 2: Generate a presigned URL for secure access
        const presignedUrl = await R2Service.getPresignedUrl(submission.r2Key, 3600); // 1 hour expiry
        return res.redirect(302, presignedUrl);

        // Option 3: Stream through the server (more server load but provides analytics/control)
        // const metadata = await R2Service.getFileMetadata(submission.r2Key);
        // res.set('Content-Type', submission.mimetype || 'audio/mpeg');
        // res.set('Content-Length', metadata.contentLength?.toString() || '');
        // res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        // const stream = await R2Service.getFileStream(submission.r2Key);
        // return stream.pipe(res);
      } catch (error) {
        console.error('Error serving R2 file:', error);
        return res.status(500).json({ message: 'Error serving submission file from storage.' });
      }
    }

    // Handle legacy local files (backward compatibility)
    if (submission.songFilePath) {
      const filePath = path.resolve(submission.songFilePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist at path:', filePath);
        return res.status(404).json({ message: 'Submission file not found on server.' });
      }

      // Set appropriate headers
      res.set('Content-Type', submission.mimetype || 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming submission file.' });
        }
      });

      return;
    }

    // No valid file source found
    return res.status(404).json({ message: 'Submission file not available.' });

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

// Add a new endpoint to get direct R2 URLs for faster access
export const getSubmissionStreamUrl = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    // Handle YouTube submissions
    if (submission.streamingSource === 'youtube') {
      if (!submission.youtubeVideoId) {
        return res.status(404).json({ message: 'YouTube video ID not found.' });
      }
      
      return res.json({
        type: 'youtube',
        streamUrl: getYouTubeEmbedUrl(submission.youtubeVideoId),
        directUrl: submission.youtubeUrl,
        expiresIn: null
      });
    }

    // Handle SoundCloud submissions
    if (submission.streamingSource === 'soundcloud') {
      if (!submission.soundcloudUrl) {
        return res.status(404).json({ message: 'SoundCloud URL not found.' });
      }
      
      return res.json({
        type: 'soundcloud',
        streamUrl: getSoundCloudEmbedUrl(submission.soundcloudUrl),
        directUrl: submission.soundcloudUrl,
        expiresIn: null
      });
    }

    if (submission.r2Key && submission.r2Url) {
      // Generate a fresh presigned URL
      const presignedUrl = await R2Service.getPresignedUrl(submission.r2Key, 3600);
      return res.json({ 
        streamUrl: presignedUrl,
        directUrl: submission.r2Url, // Public URL if available
        expiresIn: 3600 
      });
    }

    if (submission.songFilePath) {
      // For legacy files, return the API endpoint
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return res.json({ 
        streamUrl: `${baseUrl}/api/submissions/${submission._id}/file`,
        directUrl: null,
        expiresIn: null
      });
    }

    return res.status(404).json({ message: 'Submission file not available.' });

  } catch (error) {
    console.error('Error generating submission stream URL:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error while generating stream URL.' });
    }
  }
};

// Add function to clean up old files when switching to R2
export const migrateSubmissionToR2 = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.r2Key && submission.r2Url) {
      return res.status(400).json({ message: 'Submission already migrated to R2.' });
    }

    if (!submission.songFilePath) {
      return res.status(400).json({ message: 'No local file to migrate.' });
    }

    const filePath = path.resolve(submission.songFilePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Local file not found.' });
    }

    // Read file and upload to R2
    const fileBuffer = fs.readFileSync(filePath);
    const { url, key } = await R2Service.uploadSong(
      fileBuffer,
      submission.tournament.toString(),
      submission.user.toString(),
      submission.originalFileName,
      submission.mimetype,
      {
        migratedAt: new Date().toISOString(),
        originalPath: submission.songFilePath,
      }
    );

    // Update submission with R2 data
    submission.r2Key = key;
    submission.r2Url = url;
    await submission.save();

    // Optionally delete local file
    // fs.unlinkSync(filePath);

    res.json({
      message: 'Submission migrated to R2 successfully.',
      r2Url: url,
      r2Key: key
    });

  } catch (error) {
    console.error('Error migrating submission to R2:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error while migrating to R2.' });
    }
  }
};

// Add other submission controller functions as needed (e.g., create, update, delete, get details) 