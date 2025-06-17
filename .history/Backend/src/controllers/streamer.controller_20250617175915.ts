import { Request, Response } from 'express';
import Streamer, { IStreamer } from '../models/Streamer';
import streamerStatusService from '../services/streamerStatusService';

// Get all active streamers
export const getStreamers = async (req: Request, res: Response) => {
  try {
    const { platform, liveOnly } = req.query;
    
    let query: any = { isActive: true };
    
    // Filter by platform if specified
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    
    // Filter by live status if specified
    if (liveOnly === 'true') {
      query.isLive = true;
    }    const streamers = await Streamer.find(query)
      .populate('userId', 'username email bio location website genres socials.instagram socials.twitter socials.youtube socials.spotify socials.soundcloud profilePicture')
      .sort({ isFeatured: -1, isLive: -1, sortOrder: 1, name: 1 });
    
    // Convert to plain objects and ensure user data is properly structured
    const streamersData = streamers.map(streamer => {
      const streamerObj = streamer.toObject();
      
      // If userId is populated, move it to a 'user' field for frontend
      if (streamerObj.userId && typeof streamerObj.userId === 'object' && streamerObj.userId.username) {
        streamerObj.user = streamerObj.userId;
        streamerObj.userId = streamerObj.userId._id;
      }
      
      return streamerObj;
    });
    
    // Debug logging to see what we're returning
    console.log(`🔍 DEBUG Backend: Found ${streamersData.length} streamers`);
    streamersData.forEach(streamer => {
      console.log(`🔍 DEBUG Backend: ${streamer.name}:`, {
        userId: streamer.userId || 'NONE',
        hasUser: !!streamer.user,
        username: streamer.user?.username || 'NO USERNAME'
      });
    });
    
    res.json({
      success: true,
      streamers: streamersData,
      count: streamersData.length
    });
  } catch (error) {
    console.error('Error fetching streamers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streamers'
    });
  }
};

// Get single streamer
export const getStreamer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const streamer = await Streamer.findById(id)
      .populate('userId', 'username email bio location website genres socials.instagram socials.twitter socials.youtube socials.spotify socials.soundcloud profilePicture');
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      streamer
    });
  } catch (error) {
    console.error('Error fetching streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streamer'
    });
  }
};

// Create new streamer (admin only)
export const createStreamer = async (req: Request, res: Response) => {
  try {    const {
      name,
      platform,
      channelName,
      channelId,
      avatar,
      description,
      userId, // Optional user reference
      isFeatured,
      sortOrder
    } = req.body;
    
    // Check if streamer already exists
    const existingStreamer = await Streamer.findOne({
      platform,
      channelName
    });
    
    if (existingStreamer) {
      return res.status(400).json({
        success: false,
        message: 'Streamer already exists on this platform'
      });
    }
      const streamer = new Streamer({
      name,
      platform,
      channelName,
      channelId,
      avatar,
      description,
      userId: userId || undefined, // Only set if provided
      isFeatured: isFeatured || false,
      sortOrder: sortOrder || 0
    });
    
    await streamer.save();
    
    res.status(201).json({
      success: true,
      message: 'Streamer created successfully',
      streamer
    });
  } catch (error) {
    console.error('Error creating streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create streamer'
    });
  }
};

// Update streamer
export const updateStreamer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const streamer = await Streamer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Streamer updated successfully',
      streamer
    });
  } catch (error) {
    console.error('Error updating streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streamer'
    });
  }
};

// Update live status
export const updateLiveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isLive, streamTitle, viewerCount, thumbnailUrl } = req.body;
    
    const updateData: any = { isLive };
    
    if (isLive) {
      updateData.lastLiveAt = new Date();
      if (streamTitle) updateData.streamTitle = streamTitle;
      if (viewerCount !== undefined) updateData.viewerCount = viewerCount;
      if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
    } else {
      // Clear live data when going offline
      updateData.streamTitle = null;
      updateData.viewerCount = 0;
      updateData.thumbnailUrl = null;
    }
    
    const streamer = await Streamer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Live status updated successfully',
      streamer
    });
  } catch (error) {
    console.error('Error updating live status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live status'
    });
  }
};

// Delete streamer
export const deleteStreamer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const streamer = await Streamer.findByIdAndDelete(id);
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Streamer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete streamer'
    });
  }
};

// Toggle streamer active status
export const toggleActiveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const streamer = await Streamer.findById(id);
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    streamer.isActive = !streamer.isActive;
    await streamer.save();
    
    res.json({
      success: true,
      message: `Streamer ${streamer.isActive ? 'activated' : 'deactivated'} successfully`,
      streamer
    });
  } catch (error) {
    console.error('Error toggling streamer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle streamer status'
    });
  }
};

// Update streamer live status automatically (for internal use)
export const updateStreamerLiveStatusAuto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isLive, streamTitle, viewerCount, thumbnailUrl } = req.body;
    
    // Validate input
    if (typeof isLive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid isLive value'
      });
    }
    
    const updateData: any = { isLive };
    
    if (isLive) {
      updateData.lastLiveAt = new Date();
      if (streamTitle) updateData.streamTitle = streamTitle;
      if (viewerCount !== undefined) updateData.viewerCount = viewerCount;
      if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
    } else {
      // Clear live data when going offline
      updateData.streamTitle = null;
      updateData.viewerCount = 0;
      updateData.thumbnailUrl = null;
    }
    
    const streamer = await Streamer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    // Optionally, you can emit an event or call a service here
    // For example: streamerStatusService.notifyStatusChange(streamer);
    
    res.json({
      success: true,
      message: 'Live status updated successfully',
      streamer
    });
  } catch (error) {
    console.error('Error updating live status automatically:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live status'
    });
  }
};

// Update streamer live status manually (for admin use)
export const updateStreamerLiveStatusManual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isLive } = req.body;
    
    // Validate input
    if (typeof isLive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid isLive value'
      });
    }
    
    const streamer = await Streamer.findById(id);
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    streamer.isLive = isLive;
    await streamer.save();
    
    // Optionally, you can emit an event or call a service here
    // For example: streamerStatusService.notifyStatusChange(streamer);
    
    res.json({
      success: true,
      message: 'Live status updated successfully',
      streamer
    });
  } catch (error) {
    console.error('Error updating live status manually:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live status'
    });
  }
};

// Update all streamers' live status using external APIs
export const updateAllStreamersStatus = async (req: Request, res: Response) => {
  try {
    await streamerStatusService.updateAllStreamersStatus();
    
    // Get updated streamers to return
    const streamers = await Streamer.find({ isActive: true })
      .sort({ isFeatured: -1, isLive: -1, sortOrder: 1, name: 1 })
      .lean();
    
    res.json({
      success: true,
      message: 'All streamers status updated successfully',
      streamers,
      count: streamers.length
    });
  } catch (error) {
    console.error('Error updating all streamers status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streamers status'
    });
  }
};

// Update single streamer's live status
export const updateStreamerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await streamerStatusService.updateSingleStreamer(id);
    
    // Get updated streamer to return
    const streamer = await Streamer.findById(id);
    
    res.json({
      success: true,
      message: 'Streamer status updated successfully',
      streamer
    });
  } catch (error) {
    console.error('Error updating streamer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streamer status'
    });
  }
};

// Link user to streamer
export const linkUserToStreamer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // streamer ID
    const { userId } = req.body;
    
    // Verify user exists
    const User = require('../models/User').default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const streamer = await Streamer.findByIdAndUpdate(
      id,
      { userId },
      { new: true, runValidators: true }
    ).populate('userId', 'username email bio location website genres socials profilePicture');
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User linked to streamer successfully',
      streamer
    });
  } catch (error) {
    console.error('Error linking user to streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link user to streamer'
    });
  }
};

// Unlink user from streamer
export const unlinkUserFromStreamer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // streamer ID
    
    const streamer = await Streamer.findByIdAndUpdate(
      id,
      { $unset: { userId: "" } },
      { new: true, runValidators: true }
    );
    
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'Streamer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User unlinked from streamer successfully',
      streamer
    });
  } catch (error) {
    console.error('Error unlinking user from streamer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink user from streamer'
    });
  }
};
