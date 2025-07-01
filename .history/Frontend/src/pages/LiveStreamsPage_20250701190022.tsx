import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Radio, Loader } from 'lucide-react';
import StreamCard from '../components/streams/StreamCard';
import { StreamData, Streamer } from '../types/streams';
import streamingService from '../services/streamingService';

// Memoized title components for optimal scrolling performance
const PageTitle = React.memo(({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div 
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform'
    }}
  >
    <div style={{ contain: 'layout style' }}>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center">
        {Icon && <Icon className="mr-3 h-12 w-12 text-red-500" />}
        {children}
      </h1>
    </div>
  </div>
), () => true);

const SectionTitle = React.memo(({ children }: { children: React.ReactNode }) => (
  <div 
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform'
    }}
  >
    <div style={{ contain: 'layout style' }}>
      <h2 className="text-2xl font-bold text-white">
        {children}
      </h2>
    </div>
  </div>
), () => true);

const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
      <p className="text-gray-400 text-lg">Loading streamers...</p>
    </div>
  </div>
), () => true);

// Memoized status indicator for better performance
const StatusIndicator = React.memo(({ isLive }: { isLive: boolean }) => (
  <div 
    className={`w-3 h-3 rounded-full mr-3 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  ></div>
), (prevProps, nextProps) => prevProps.isLive === nextProps.isLive);

// Memoized count badge for optimal performance
const CountBadge = React.memo(({ count, isLive }: { count: number; isLive: boolean }) => (
  <span 
    className={`ml-3 px-2 py-1 rounded-full text-sm font-medium ${
      isLive 
        ? 'bg-red-500/20 text-red-400' 
        : 'bg-gray-500/20 text-gray-400'
    }`}
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  >
    {count}
  </span>
), (prevProps, nextProps) => prevProps.count === nextProps.count && prevProps.isLive === nextProps.isLive);

// Memoized section header wrapper
const SectionHeader = React.memo(({ 
  children, 
  count, 
  isLive = false 
}: { 
  children: React.ReactNode; 
  count: number; 
  isLive?: boolean;
}) => (
  <div 
    className="flex items-center mb-6"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  >
    <div className="flex items-center">
      <StatusIndicator isLive={isLive} />
      <SectionTitle>
        {children}
      </SectionTitle>
      <CountBadge count={count} isLive={isLive} />
    </div>
  </div>
), (prevProps, nextProps) => 
  prevProps.count === nextProps.count && 
  prevProps.isLive === nextProps.isLive &&
  prevProps.children === nextProps.children
);

// Memoized empty state components
const EmptyState = React.memo(() => (
  <div 
    className="text-center py-20"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  >
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
), () => true);

const NoLiveStreamsNotice = React.memo(() => (
  <div 
    className="mb-8 text-center"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  >
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
      <Radio className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">No Live Streams Right Now</h3>
      <p className="text-gray-400">
        Check out our featured streamers below who have streamed recently!
      </p>
    </div>
  </div>
), () => true);

// Memoized error state component
const ErrorState = React.memo(({ error }: { error: string }) => (
  <div 
    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate'
    }}
  >
    <p className="text-red-400">{error}</p>
  </div>
), (prevProps, nextProps) => prevProps.error === nextProps.error);

const LiveStreamsPage: React.FC = () => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch streamers from database
  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        setLoading(true);
        setError(null);        // Get all streamers from the database
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
  }, []);  // Convert Streamer to StreamData format for the existing StreamCard component
  const convertToStreamData = useCallback((streamer: Streamer): StreamData => {
    const converted = {
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
      userId: streamer.userId,
      user: streamer.user ? {
        ...streamer.user,
        profilePictureUrl: streamer.user.profilePicture 
          ? `data:${streamer.user.profilePicture.contentType};base64,${streamer.user.profilePicture.data}` 
          : undefined
      } : undefined,
      bio: streamer.description
    };
    
    return converted;
  }, []);

  // Convert streamers to stream data
  const streamData = useMemo(() => 
    streamers.map(convertToStreamData),
    [streamers, convertToStreamData]
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
      <div 
        className="min-h-screen p-6 md:p-8"
        style={{
          contain: 'layout style',
          transform: 'translate3d(0,0,0)',
          isolation: 'isolate'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="mb-8"
            style={{
              contain: 'layout style paint',
              transform: 'translate3d(0,0,0)',
              isolation: 'isolate'
            }}
          >
            <PageTitle>
              Live Streams
            </PageTitle>
            <p className="text-gray-400 text-lg">
              Watch curated music creators live on Twitch, YouTube, and Kick
            </p>
          </div>
          
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{
        contain: 'layout style',
        transform: 'translate3d(0,0,0)',
        isolation: 'isolate'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div 
          className="mb-8"
          style={{
            contain: 'layout style paint',
            transform: 'translate3d(0,0,0)',
            isolation: 'isolate'
          }}
        >
          <PageTitle>
            Live Streams
          </PageTitle>
          <p className="text-gray-400 text-lg">
            Watch curated music creators live on Twitch, YouTube, and Kick
          </p>
        </div>

        {/* Error State */}
        {error && (
          <ErrorState error={error} />
        )}

        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <div className="mb-12">
            <SectionHeader count={liveStreams.length} isLive={true}>
              Currently Live
            </SectionHeader>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{
                contain: 'layout style',
                transform: 'translate3d(0,0,0)',
                isolation: 'isolate'
              }}
            >
              {liveStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </div>
        )}

        {/* Offline Streamers Section */}
        {offlineStreams.length > 0 && (
          <div className="mb-12">
            <SectionHeader count={offlineStreams.length} isLive={false}>
              Recently Streamed
            </SectionHeader>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{
                contain: 'layout style',
                transform: 'translate3d(0,0,0)',
                isolation: 'isolate'
              }}
            >
              {offlineStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {streamData.length === 0 && !loading && (
          <EmptyState />
        )}

        {/* No Live Streams but have offline streamers */}
        {liveStreams.length === 0 && offlineStreams.length > 0 && (
          <NoLiveStreamsNotice />
        )}
      </div>
    </div>
  );
};

export default LiveStreamsPage;