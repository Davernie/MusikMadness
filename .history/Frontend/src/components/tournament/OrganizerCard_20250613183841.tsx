import React from 'react';
import { Link } from 'reac        <h3 className="text-lg font-bold mb-5 text-center" style={{
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            letterSpacing: '3px'
          }}>
          Tournament Organizer
        </h3>-dom';
import { User, Instagram, Twitter, Globe, ShieldCheck, Music, Youtube } from 'lucide-react';
import defaultAvatar from '../../assets/images/default-avatar.png';

interface Organizer {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    website?: string;
    soundcloud?: string;
    spotify?: string;
    youtube?: string;
  };
  website?: string;
  location?: string;
}

interface OrganizerCardProps {
  organizer: Organizer;
  colors: { primary: string; secondary: string; accent: string };
}

const OrganizerCard: React.FC<OrganizerCardProps> = ({
  organizer,
  colors
}) => {
  const organizerProfileLink = organizer.id ? `/profile/${organizer.id}` : '#';

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 relative group h-full flex flex-col">
      {/* Accent color bar at top */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.primary}, 0.4))`,
        }}
      ></div>
      
      {/* Subtle glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          boxShadow: `inset 0 0 15px rgba(${colors.primary}, 0.1)`,
          background: `radial-gradient(circle at top left, rgba(${colors.primary}, 0.05), transparent 70%)`,
        }}
      ></div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg mb-4" style={{ 
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: `rgb(${colors.primary})`,
            textShadow: `0 0 10px rgba(${colors.primary}, 0.1), 0 0 20px rgba(${colors.primary}, 0.1)`,
            letterSpacing: '3px'
          }}>
          Tournament Organizer
        </h3>
        
        <div className="flex items-center mb-5 pb-5 border-b border-white/10">
          <div className="relative">
            <img 
              src={organizer.avatar || defaultAvatar}
              alt={organizer.username}
              className="w-16 h-16 rounded-md border-2 border-white/20 object-cover group-hover:border-white/30 transition-all duration-300 shadow-md"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
                e.currentTarget.onerror = null;
              }}
            />
            <div 
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-700 shadow"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-xl text-white">{organizer.username}</h4>
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <User className="h-3 w-3 inline mr-1.5 text-gray-500" />
              Professional Organizer
            </p>
          </div>
        </div>

        <div className="space-y-5 flex-grow flex flex-col">
          <div className="text-sm text-gray-300 leading-relaxed mb-auto">
            {organizer.bio || 'No bio available for this organizer.'}
          </div>
          
          {/* Social links - dynamic based on organizer data */}
          <div className="flex flex-wrap gap-2 pt-4">
            {organizer.socials?.instagram && (
              <a 
                href={organizer.socials.instagram.startsWith('http') ? organizer.socials.instagram : `https://instagram.com/${organizer.socials.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="Instagram"
              >
                <Instagram className="h-5 w-5 text-pink-400" />
              </a>
            )}
            {organizer.socials?.twitter && (
              <a 
                href={organizer.socials.twitter.startsWith('http') ? organizer.socials.twitter : `https://twitter.com/${organizer.socials.twitter}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="Twitter"
              >
                <Twitter className="h-5 w-5 text-cyan-400" />
              </a>
            )}
            {organizer.socials?.soundcloud && (
              <a 
                href={organizer.socials.soundcloud.startsWith('http') ? organizer.socials.soundcloud : `https://soundcloud.com/${organizer.socials.soundcloud}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="SoundCloud"
              >
                <Music className="h-5 w-5 text-orange-400" />
              </a>
            )}
            {organizer.socials?.spotify && (
              <a 
                href={organizer.socials.spotify.startsWith('http') ? organizer.socials.spotify : `https://open.spotify.com/artist/${organizer.socials.spotify}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="Spotify"
              >
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
            )}
            {organizer.socials?.youtube && (
              <a 
                href={organizer.socials.youtube.startsWith('http') ? organizer.socials.youtube : `https://youtube.com/${organizer.socials.youtube}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="YouTube"
              >
                <Youtube className="h-5 w-5 text-red-400" />
              </a>
            )}
            {(organizer.website || organizer.socials?.website) && (
              <a 
                href={organizer.website || organizer.socials?.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105"
                title="Website"
              >
                <Globe className="h-5 w-5 text-purple-400" />
              </a>
            )}
          </div>
          
          {/* Show message if no social links */}
          {!organizer.socials?.instagram && 
           !organizer.socials?.twitter && 
           !organizer.socials?.soundcloud && 
           !organizer.socials?.spotify && 
           !organizer.socials?.youtube && 
           !organizer.website && 
           !organizer.socials?.website && (
            <p className="text-xs text-gray-500 py-2">No social links available</p>
          )}
          
          {/* View Profile Button as Link */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <Link 
              to={organizerProfileLink} 
              className={`w-full block py-2.5 px-4 rounded-lg font-semibold text-white text-center transition-all duration-300 relative group ${!organizer.id ? 'cursor-not-allowed opacity-70' : ''}`}
              style={{
                background: `linear-gradient(135deg, rgba(${colors.primary}, 0.7), rgba(${colors.secondary}, 0.6))`,
                boxShadow: `0 4px 15px rgba(${colors.primary}, 0.3), 0 0 0 1px rgba(${colors.primary}, 0.4)`,
                overflow: 'hidden'
              }}
              onClick={(e) => !organizer.id && e.preventDefault()}
            >
              <span className="relative z-10 flex items-center justify-center">
                <User className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" style={{filter: "drop-shadow(0 0 2px rgba(255,255,255,0.4))"}} />
                View Profile
              </span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(${colors.primary}, 0.9), rgba(${colors.secondary}, 0.8))`,
                }}
              ></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerCard;