import { Request, Response } from 'express';
import Streamer, { IStreamer } from '../models/Streamer';

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
    }
    
    const streamers = await Streamer.find(query)
      .sort({ isFeatured: -1, isLive: -1, sortOrder: 1, name: 1 })
      .lean();
    
    res.json({
      success: true,
      streamers,
      count: streamers.length
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
    
    const streamer = await Streamer.findById(id);
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
  try {
    const {
      name,
      platform,
      channelName,
      channelId,
      avatar,
      description,
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
