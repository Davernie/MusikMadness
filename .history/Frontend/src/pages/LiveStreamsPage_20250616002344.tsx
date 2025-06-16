import React, { useMemo, useState, useEffect } from 'react';
import { Radio, Loader } from 'lucide-react';
import StreamCard from '../components/streams/StreamCard';
import { StreamData, Streamer } from '../types/streams';
import streamingService from '../services/streamingService';

const LiveStreamsPage: React.FC = () => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch streamers from database
  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all streamers from the database
        const response = await streamingService.getStreamers(1, 50); // Get more streamers for better display
        setStreamers(response.streamers);
        
      } catch (err) {
        console.error('Error fetching streamers:', err);
        setError('Failed to load streamers');
        
        // Fallback to empty array - we'll show empty state
        setStreamers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamers();
  }, []);

  // Convert Streamer to StreamData format for the existing StreamCard component
  const convertToStreamData = (streamer: Streamer): StreamData => {
    return {
      id: streamer._id,
      name: streamer.name,
      platform: streamer.platform,
      channelName: streamer.channelName,
      channelId: streamer.channelId,
      avatar: streamer.avatar,
      isLive: streamer.isLive,
      streamTitle: streamer.streamTitle || `${streamer.name} is streaming!`,
      viewerCount: streamer.viewerCount,
      thumbnailUrl: streamer.thumbnailUrl,
      bio: streamer.description
    };
  };
        platform = 'twitch'; // Map SoundCloud to Twitch for display
        channelName = streamer.socials.soundcloud;
      } else if (streamer.socials?.instagram) {
        platform = 'kick'; // Map Instagram to Kick for display
        channelName = streamer.socials.instagram;
      }
    }

    return {
      id: streamer._id,
      name: streamer.username,
      platform,
      channelName,
      avatar: streamer.profilePictureUrl || `https://picsum.photos/seed/${streamer.username}/100/100`,
      isLive: streaming?.isLive || false,
      streamTitle: streaming?.streamTitle || `${streamer.username} is creating music! 🎵`,
      viewerCount: streaming?.viewerCount || 0,
      thumbnailUrl: streaming?.thumbnailUrl || `https://picsum.photos/seed/${streamer.username}-stream/320/180`,
      userId: streamer._id,
      bio: streamer.bio,
      location: streamer.location
    };
  };

  // Convert streamers to stream data
  const streamData = useMemo(() => 
    streamers.map(convertToStreamData),
    [streamers]
  );

  // Filter live and offline streams
  const liveStreams = useMemo(() => 
    streamData.filter(stream => stream.isLive), 
    [streamData]
  );
  
  const offlineStreams = useMemo(() => 
    streamData.filter(stream => !stream.isLive), 
    [streamData]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center"
              style={{ fontFamily: 'Crashbow, sans-serif' }}
            >
              <span className="inline-block w-2 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500 mr-4"></span>
              Live Streams
            </h1>
            <p className="text-gray-400 text-lg">
              Watch curated music creators live on Twitch, YouTube, and Kick
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading streamers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center"
            style={{ fontFamily: 'Crashbow, sans-serif' }}
          >
            <span className="inline-block w-2 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500 mr-4"></span>
            Live Streams
          </h1>
          <p className="text-gray-400 text-lg">
            Watch curated music creators live on Twitch, YouTube, and Kick
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                <h2 className="text-2xl font-bold text-white">Currently Live</h2>
                <span className="ml-3 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm font-medium">
                  {liveStreams.length}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </div>
        )}

        {/* Offline Streamers Section */}
        {offlineStreams.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white">Recently Streamed</h2>
                <span className="ml-3 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-sm font-medium">
                  {offlineStreams.length}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {streamData.length === 0 && !loading && (
          <div className="text-center py-20">
            <Radio className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">No Streamers Found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              There are currently no streamers in the database. Users can enable streaming in their profile settings to appear here.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-400 text-sm">
                <strong>For streamers:</strong> Go to your profile settings and enable "Streamer Mode" to appear on this page!
              </p>
            </div>
          </div>
        )}

        {/* No Live Streams but have offline streamers */}
        {liveStreams.length === 0 && offlineStreams.length > 0 && (
          <div className="mb-8 text-center">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <Radio className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Live Streams Right Now</h3>
              <p className="text-gray-400">
                Check out our featured streamers below who have streamed recently!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamsPage; 