import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Eye, MapPin, Globe, Instagram, Twitter, Music } from 'lucide-react';
import { StreamData } from '../../types/streams';

interface StreamCardProps {
  stream: StreamData;
}

// Platform colors and icons
const getPlatformConfig = (platform: string) => {
  switch (platform) {
    case 'twitch':
      return {
        color: 'rgb(145, 70, 255)', // Twitch purple
        bgColor: 'rgba(145, 70, 255, 0.1)',
        borderColor: 'rgba(145, 70, 255, 0.3)'
      };
    case 'youtube':
      return {
        color: 'rgb(255, 0, 0)', // YouTube red
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
  const navigate = useNavigate();
  
  // Debug logging to see what data the component receives
  console.log(`🔍 DEBUG: StreamCard for ${stream.name}:`, {
    hasUser: !!stream.user,
    username: stream.user?.username || 'NO USERNAME',
    userId: stream.userId || 'NO USER ID',
    userObject: stream.user,
    profilePictureUrl: stream.user?.profilePictureUrl || 'NO PROFILE PIC',
    location: stream.user?.location || 'NO LOCATION',
    socials: stream.user?.socials || 'NO SOCIALS'
  });

  const platformConfig = getPlatformConfig(stream.platform);
  const platformUrl = getPlatformUrl(stream.platform, stream.channelName, stream.channelId);

  const handleWatchClick = () => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers
    if (stream.user) {
      // Use user._id if available, fallback to userId
      const userIdToUse = stream.user._id || stream.userId;
      if (userIdToUse) {
        navigate(`/profile/${userIdToUse}`);
      }
    }  };

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
                {stream.viewerCount?.toLocaleString()}
              </span>
            </div>
          )}
        </div>        {/* Creator Info */}
        <div className="flex items-center mb-3">
          <img 
            src={stream.user?.profilePictureUrl || stream.avatar} 
            alt={stream.user?.username || stream.name}
            className={`w-10 h-10 rounded-full object-cover mr-3 border border-white/10 ${
              stream.user ? 'cursor-pointer hover:border-purple-400 transition-colors' : ''
            }`}
            onClick={stream.user ? handleProfileClick : undefined}
          />
          <div className="flex-1 min-w-0">
            <h3 
              className={`text-white font-semibold text-sm truncate ${
                stream.user ? 'cursor-pointer hover:text-purple-400 transition-colors' : ''
              }`}
              onClick={stream.user ? handleProfileClick : undefined}
            >
              {stream.user?.username || stream.name}
            </h3>
            <p className="text-gray-400 text-xs">@{stream.channelName}</p>
            {stream.user?.location && (
              <p className="text-gray-500 text-xs flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {stream.user?.location}
              </p>
            )}
          </div>
        </div>

        {/* User Bio (if available) */}
        {stream.user?.bio && (
          <div className="mb-3">
            <p className="text-gray-300 text-xs line-clamp-2">{stream.user?.bio}</p>
          </div>
        )}

        {/* User Socials (if available) */}
        {stream.user?.socials && Object.values(stream.user.socials).some(link => link) && (
          <div className="flex items-center gap-2 mb-3">
            {stream.user.socials.instagram && (
              <a 
                href={`https://instagram.com/${stream.user.socials.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {stream.user.socials.twitter && (
              <a 
                href={`https://twitter.com/${stream.user.socials.twitter}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {stream.user.socials.soundcloud && (
              <a 
                href={`https://soundcloud.com/${stream.user.socials.soundcloud}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Music className="h-4 w-4" />
              </a>
            )}
            {stream.user.website && (
              <a 
                href={stream.user.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* User Genres (if available) */}
        {stream.user?.genres && stream.user.genres.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {stream.user.genres.slice(0, 3).map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300 border border-white/20"
                >
                  {genre}
                </span>
              ))}
              {stream.user.genres.length > 3 && (
                <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-400 border border-white/20">
                  +{stream.user.genres.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

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