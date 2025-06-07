import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Track from '../models/Track';

// Create a new track
export const createTrack = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, artist, album, releaseYear, genre, spotifyId, youtubeId, imageUrl } = req.body;
    const userId = req.user?.userId;

    // Create track
    const track = new Track({
      title,
      artist,
      album,
      releaseYear,
      genre,
      spotifyId,
      youtubeId,
      imageUrl,
      addedBy: userId
    });

    await track.save();

    res.status(201).json({
      message: 'Track created successfully',
      track
    });
  } catch (error) {
    console.error('Create track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tracks (paginated)
export const getAllTracks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    // Build query
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { artist: { $regex: search, $options: 'i' } },
          { album: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const tracks = await Track.find(query)
      .populate('addedBy', 'username profilePicture')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Track.countDocuments(query);

    res.json({
      tracks,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tracks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get track by ID
export const getTrackById = async (req: Request, res: Response) => {
  try {
    const trackId = req.params.id;

    const track = await Track.findById(trackId)
      .populate('addedBy', 'username profilePicture');

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update track
export const updateTrack = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trackId = req.params.id;
    const userId = req.user?.userId;
    const { title, artist, album, releaseYear, genre, spotifyId, youtubeId, imageUrl } = req.body;

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if user is the one who added the track
    if (track.addedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this track' });
    }

    // Update track
    const updateData: { [key: string]: any } = {};
    if (title) updateData.title = title;
    if (artist) updateData.artist = artist;
    if (album !== undefined) updateData.album = album;
    if (releaseYear) updateData.releaseYear = releaseYear;
    if (genre) updateData.genre = genre;
    if (spotifyId !== undefined) updateData.spotifyId = spotifyId;
    if (youtubeId !== undefined) updateData.youtubeId = youtubeId;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedTrack = await Track.findByIdAndUpdate(
      trackId,
      { $set: updateData },
      { new: true }
    ).populate('addedBy', 'username profilePicture');

    res.json({
      message: 'Track updated successfully',
      track: updatedTrack
    });
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete track
export const deleteTrack = async (req: Request, res: Response) => {
  try {
    const trackId = req.params.id;
    const userId = req.user?.userId;

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if user is the one who added the track
    if (track.addedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this track' });
    }

    // Delete the track
    await Track.findByIdAndDelete(trackId);

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get track stream URL
export const getTrackStreamUrl = async (req: Request, res: Response) => {
  try {
    const trackId = req.params.id;
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if this is a submission or a general track
    // For now, let's assume direct Track models might also have youtubeId
    if (track.youtubeId) {
      // Construct YouTube stream URL (embed URL for frontend player)
      // You might want to use a library for more robust stream URL generation if needed
      const embedUrl = `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1`;
      return res.json({ streamUrl: embedUrl, sourceType: 'youtube' });
    } else if (track.s3Key && track.s3Bucket) { // Assuming s3Key and s3Bucket for R2 uploads
      // TODO: Implement R2 signed URL generation for direct uploads
      // For now, returning a placeholder or direct link if public
      const streamUrl = `https://your-r2-public-bucket-url/${track.s3Key}`; // Replace with actual R2 logic
      return res.json({ streamUrl, sourceType: 'r2' });
    } else {
      // Fallback or if it's another type of track source
      return res.status(400).json({ message: 'Track source not streamable or not configured' });
    }

  } catch (error) {
    console.error('Get track stream URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};