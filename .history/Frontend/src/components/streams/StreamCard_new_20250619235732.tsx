import React from 'react';
import { ExternalLink, Eye, Play, Twitch, Youtube } from 'lucide-react';
// TODO: Ensure the correct type is exported from '../../types/streams'
import type { StreamCardProps } from '../../types/streams';
// If 'StreamCardProps' does not exist, replace with the correct type name exported from '../../types/streams'

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

  const handleExternalLink = () => {
    let url = '';
    switch (streamer.platform) {
      case 'twitch':
        url = `https://www.twitch.tv/${streamer.channelName}`;
        break;
      case 'youtube':
        url = streamer.channelId 
          ? `https://www.youtube.com/channel/${streamer.channelId}`
          : `https://www.youtube.com/@${streamer.channelName}`;
        break;
      case 'kick':
        url = `https://kick.com/${streamer.channelName}`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  const colors = getPlatformColors();

  // Card styles matching tournament cards
  const cardStyles = {
    background: 'rgba(15, 15, 20, 0.7)',
    boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.accent.replace('0.8', '0.1')}`,
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:transform hover:-translate-y-1 backdrop-blur-sm"
      style={cardStyles}
    >
      {/* Border with color accent */}
      <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
      
      {/* Accent color bar at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(to right, ${colors.accent}, ${colors.accent.replace('0.8', '0.4')})`,
        }}
      ></div>

      <div className="relative p-6">
        {/* Header with live status and platform badge */}
        <div className="flex items-center justify-between mb-4">
          {/* Live indicator */}
          {streamer.isLive && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-red-400 text-sm font-semibold">LIVE</span>
            </div>
          )}
          
          {/* Platform badge */}
          <div className={`${colors.bg} rounded-full p-2 text-white`}>
            {getPlatformIcon()}
          </div>
        </div>

        {/* Stream thumbnail/avatar */}
        <div className="relative mb-4">
          <img 
            src={streamer.thumbnailUrl || streamer.avatar}
            alt={`${streamer.name} stream`}
            className="w-full h-32 object-cover rounded-lg border border-white/10"
            onError={(e) => {
              e.currentTarget.src = streamer.avatar;
            }}
          />
          {streamer.isLive && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center space-x-1">
              <Eye className="h-3 w-3 text-white" />
              <span className="text-white text-xs">{streamer.viewerCount || 0}</span>
            </div>
          )}
        </div>

        {/* Creator info */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <img 
              src={streamer.avatar}
              alt={streamer.name}
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <div>
              <h3 className="font-semibold text-white truncate">{streamer.name}</h3>
              <p className="text-xs text-gray-400 capitalize">{streamer.platform}</p>
            </div>
          </div>
          
          {streamer.isLive && streamer.streamTitle && (
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
              {streamer.streamTitle}
            </p>
          )}
          
          {streamer.description && !streamer.isLive && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {streamer.description}
            </p>
          )}
        </div>        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleExternalLink}
            className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 px-4 transition-all duration-300 group-hover:scale-[1.02]"
          >
            <ExternalLink className="h-4 w-4 text-white" />
            <span className="text-white text-sm">
              Watch on {streamer.platform.charAt(0).toUpperCase() + streamer.platform.slice(1)}
            </span>
          </button>
        </div>

        {/* Featured badge */}
        {streamer.isFeatured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ⭐ Featured
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamCard;
