import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';

// Get all streamers (users with isStreamer: true)
export const getAllStreamers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const liveOnly = req.query.liveOnly === 'true';
    
    // Build query
    let query: any = { 'streaming.isStreamer': true };
    if (liveOnly) {
      query['streaming.isLive'] = true;
    }
    
    const streamers = await User.find(query)
      .select('-password -profilePicture.data -coverImage.data')
      .skip(skip)
      .limit(limit)
      .sort({ 'streaming.isLive': -1, 'streaming.lastStreamedAt': -1 }); // Live first, then by last streamed
    
    const total = await User.countDocuments(query);
    
    // Format streamers to include image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formattedStreamers = streamers.map(user => {
      const userData = user.toObject();
      userData.profilePictureUrl = user.profilePicture?.contentType ? 
        `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
      userData.coverImageUrl = user.coverImage?.contentType ? 
        `${baseUrl}/api/users/${user._id}/cover-image` : undefined;
      return userData;
    });
    
    res.json({
      streamers: formattedStreamers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get streamers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update streaming settings (for the authenticated user)
export const updateStreamingSettings = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user?.userId;
    const {
      isStreamer,
      streamTitle,
      streamDescription,
      preferredPlatform,
      thumbnailUrl,
      streamingSchedule,
      streamCategories
    } = req.body;
    
    const updateData: any = {};
    if (isStreamer !== undefined) updateData['streaming.isStreamer'] = isStreamer;
    if (streamTitle !== undefined) updateData['streaming.streamTitle'] = streamTitle;
    if (streamDescription !== undefined) updateData['streaming.streamDescription'] = streamDescription;
    if (preferredPlatform !== undefined) updateData['streaming.preferredPlatform'] = preferredPlatform;
    if (thumbnailUrl !== undefined) updateData['streaming.thumbnailUrl'] = thumbnailUrl;
    if (streamingSchedule !== undefined) updateData['streaming.streamingSchedule'] = streamingSchedule;
    if (streamCategories !== undefined) updateData['streaming.streamCategories'] = streamCategories;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password -profilePicture.data -coverImage.data');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userData = user.toObject();
    userData.profilePictureUrl = user.profilePicture?.contentType ? 
      `${baseUrl}/api/users/${user._id}/profile-picture` : undefined;
    
    res.json({ message: 'Streaming settings updated successfully', user: userData });
  } catch (error) {
    console.error('Update streaming settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Go live / Go offline
export const updateLiveStatus = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user?.userId;
    const { isLive, streamTitle, viewerCount } = req.body;
    
    const updateData: any = {
      'streaming.isLive': isLive
    };
    
    if (isLive) {
      updateData['streaming.streamStartedAt'] = new Date();
      if (streamTitle) updateData['streaming.streamTitle'] = streamTitle;
      if (viewerCount !== undefined) updateData['streaming.viewerCount'] = viewerCount;
    } else {
      updateData['streaming.lastStreamedAt'] = new Date();
      updateData['streaming.viewerCount'] = 0;
      updateData['$unset'] = { 'streaming.streamStartedAt': 1 };
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      isLive ? { $set: updateData } : { $set: updateData, $unset: updateData['$unset'] },
      { new: true }
    ).select('-password -profilePicture.data -coverImage.data');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: `Successfully went ${isLive ? 'live' : 'offline'}`, 
      isLive: user.streaming?.isLive,
      streamStartedAt: user.streaming?.streamStartedAt,
      lastStreamedAt: user.streaming?.lastStreamedAt
    });
  } catch (error) {
    console.error('Update live status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update viewer count (can be called by streaming platform webhooks or manual updates)
export const updateViewerCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { viewerCount } = req.body;
    
    if (typeof viewerCount !== 'number' || viewerCount < 0) {
      return res.status(400).json({ message: 'Invalid viewer count' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'streaming.viewerCount': viewerCount } },
      { new: true }
    ).select('streaming.viewerCount streaming.isLive');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Viewer count updated',
      viewerCount: user.streaming?.viewerCount,
      isLive: user.streaming?.isLive
    });
  } catch (error) {
    console.error('Update viewer count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get streaming stats
export const getStreamingStats = async (req: Request, res: Response) => {
  try {
    const totalStreamers = await User.countDocuments({ 'streaming.isStreamer': true });
    const liveStreamers = await User.countDocuments({ 
      'streaming.isStreamer': true, 
      'streaming.isLive': true 
    });
    
    // Get total viewer count across all live streams
    const liveStreamerData = await User.find({ 
      'streaming.isStreamer': true, 
      'streaming.isLive': true 
    }).select('streaming.viewerCount');
    
    const totalViewers = liveStreamerData.reduce((sum, user) => 
      sum + (user.streaming?.viewerCount || 0), 0
    );
    
    // Get platform distribution
    const platformStats = await User.aggregate([
      { $match: { 'streaming.isStreamer': true } },
      { $group: { 
        _id: '$streaming.preferredPlatform', 
        count: { $sum: 1 } 
      }}
    ]);
    
    res.json({
      totalStreamers,
      liveStreamers,
      totalViewers,
      platformDistribution: platformStats
    });
  } catch (error) {
    console.error('Get streaming stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 