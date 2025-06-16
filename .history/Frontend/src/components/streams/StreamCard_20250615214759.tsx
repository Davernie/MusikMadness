import React from 'react';
import { ExternalLink, Eye, Play, Twitch, Youtube } from 'lucide-react';
import { StreamCardProps } from '../../types/streams';

const StreamCard: React.FC<StreamCardProps> = ({ streamer, onWatchHere }) => {
  const getPlatformIcon = () => {
    switch (streamer.platform) {
      case 'twitch':
        return <Twitch className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'kick':
        return <div className="h-4 w-4 rounded bg-green-500 text-white text-xs flex items-center justify-center font-bold">K</div>;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getPlatformColors = () => {
    switch (streamer.platform) {
      case 'twitch':
        return { bg: 'bg-purple-600', accent: 'rgba(147, 51, 234, 0.8)' };
      case 'youtube':
        return { bg: 'bg-red-600', accent: 'rgba(239, 68, 68, 0.8)' };
      case 'kick':
        return { bg: 'bg-green-600', accent: 'rgba(34, 197, 94, 0.8)' };
      default:
        return { bg: 'bg-gray-600', accent: 'rgba(107, 114, 128, 0.8)' };
    }
  };
        bgColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: 'rgba(255, 0, 0, 0.3)'
      };
    case 'kick':
      return {
        color: 'rgb(83, 255, 26)', // Kick green
        bgColor: 'rgba(83, 255, 26, 0.1)',
        borderColor: 'rgba(83, 255, 26, 0.3)'
      };
    default:
      return {
        color: 'rgb(156, 163, 175)',
        bgColor: 'rgba(156, 163, 175, 0.1)',
        borderColor: 'rgba(156, 163, 175, 0.3)'
      };
  }
};

const getPlatformUrl = (platform: string, channelName: string, channelId?: string) => {
  switch (platform) {
    case 'twitch':
      return `https://twitch.tv/${channelName}`;
    case 'youtube':
      if (channelId) {
        return `https://youtube.com/channel/${channelId}`;
      }
      return `https://youtube.com/@${channelName}`;
    case 'kick':
      return `https://kick.com/${channelName}`;
    default:
      return '#';
  }
};

const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  const platformConfig = getPlatformConfig(stream.platform);
  const platformUrl = getPlatformUrl(stream.platform, stream.channelName, stream.channelId);

  const handleWatchClick = () => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:transform hover:-translate-y-1 h-full backdrop-blur-sm bg-black/20 border border-white/5">
      {/* Accent color bar at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(to right, ${platformConfig.color}, ${platformConfig.color}66)`,
        }}
      ></div>
      
      <div className="relative p-4 h-full flex flex-col">
        {/* Thumbnail/Preview Section */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img 
            src={stream.thumbnailUrl || `https://picsum.photos/seed/${stream.id}/320/180`} 
            alt={stream.streamTitle}
            className="w-full h-40 object-cover transform transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          {/* Live indicator - only show when actually live */}
          {stream.isLive && (
            <div className="absolute top-3 left-3 flex items-center">
              <div className="flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </div>
            </div>
          )}

          {/* Platform badge */}
          <div className="absolute top-3 right-3">
            <span 
              className="px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border capitalize"
              style={{
                backgroundColor: platformConfig.bgColor,
                color: platformConfig.color,
                borderColor: platformConfig.borderColor
              }}
            >
              {stream.platform}
            </span>
          </div>

          {/* Viewer count */}
          {stream.isLive && stream.viewerCount && (
            <div className="absolute bottom-3 right-3">
              <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm border border-white/20">
                <Eye className="h-3 w-3 mr-1" />
                {stream.viewerCount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Creator Info */}
        <div className="flex items-center mb-3">
          <img 
            src={stream.avatar} 
            alt={stream.name}
            className="w-10 h-10 rounded-full object-cover mr-3 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{stream.name}</h3>
            <p className="text-gray-400 text-xs">@{stream.channelName}</p>
          </div>
        </div>

        {/* Stream Title */}
        <h4 className="text-white text-sm font-medium mb-4 line-clamp-2 flex-1">
          {stream.streamTitle}
        </h4>

        {/* Action Button */}
        <button
          onClick={handleWatchClick}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border"
          style={{
            backgroundColor: platformConfig.bgColor,
            color: platformConfig.color,
            borderColor: platformConfig.borderColor
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = platformConfig.color;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = platformConfig.bgColor;
            e.currentTarget.style.color = platformConfig.color;
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Watch on {stream.platform.charAt(0).toUpperCase() + stream.platform.slice(1)}
        </button>
      </div>
    </div>
  );
};

export default StreamCard; 