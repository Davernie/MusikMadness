import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Users, Clock, Instagram, Twitter, Globe, Music, Youtube } from 'lucide-react';
import { Tournament } from '../types';
import { daysLeft, getGenreColors } from '../utils/tournamentUtils';
import { formatDateTime } from '../utils/dateUtils';
import defaultAvatar from '../assets/images/default-avatar.png';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = React.memo(({ tournament }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    id,
    title,
    coverImage,
    startDate,
    endDate,
    prizePool,
    entryFee,
    participants,
    maxParticipants,
    genre,
    status,
    organizer,
    language
  } = tournament;

  const primaryGenre = Array.isArray(genre) ? genre[0] : genre;
  const colors = getGenreColors(primaryGenre || 'Electronic');



  // Common card styles with subtle genre color
  const cardStyles = {
    background: 'rgba(15, 15, 20, 0.7)',
    boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(${colors.primary}, 0.1)`,
  };

  const organizerProfileLink = organizer.id ? `/profile/${organizer.id}` : '#';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flipping if clicking on a link, button, or their children
    const target = e.target as Element;
    const isClickableElement = target.closest('a') || target.closest('button');
    const isLinkOrButton = target.tagName === 'A' || target.tagName === 'BUTTON';
    
    if (isClickableElement || isLinkOrButton) {
      return;
    }
    
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="group relative h-[500px]"
      style={{ perspective: '1000px' }}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl"
          style={{ 
            backfaceVisibility: 'hidden',
            ...cardStyles
          }}
          onClick={handleCardClick}
        >
          <div className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:transform hover:-translate-y-1 h-full backdrop-blur-sm">
            {/* Border with color accent */}
            <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
            
            {/* Accent color bar at top */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.primary}, 0.4))`,
              }}
            ></div>
            
            <div className="relative p-6 h-full flex flex-col">
              {/* Cover Image Section */}
              <div className="relative overflow-hidden rounded-lg mb-5">
                <img 
                  src={coverImage} 
                  alt={title}
                  className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    status === 'Open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Prize Pool */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-sm border border-white/10">
                    ${prizePool} Prize
                  </span>
                </div>
              </div>
              
              {/* Title with subtle color accent */}
              <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                <span 
                  className="inline-block w-1 h-6 rounded-full"
                  style={{ background: `rgba(${colors.primary}, 0.8)` }}
                ></span>
                {title}
              </h3>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 mr-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="truncate">{formatDateTime(startDate)}</span>
                  </div>                  <div className="flex items-center text-sm text-gray-300">
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 mr-2">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span>{participants?.length || 0}/{maxParticipants}</span>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-3">
                  {status !== 'Completed' && (
                    <div className="flex items-center text-sm text-gray-300">
                      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 mr-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <span>{daysLeft(endDate)} days left</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 mr-2">
                      <Globe className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span>{language}</span>
                  </div>
                </div>
              </div>

              {/* Genre Tag - With accent color */}
              <div className="mb-5">
                <div 
                  className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-white"
                  style={{ 
                    background: `rgba(${colors.primary}, 0.15)`, 
                    border: `1px solid rgba(${colors.primary}, 0.3)` 
                  }}
                >
                  <Music className="h-3 w-3 mr-1.5" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                  {primaryGenre}
                </div>
                
                {entryFee > 0 ? (
                  <div className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-white ml-2 bg-white/5 border border-white/10">
                    <Trophy className="h-3 w-3 mr-1.5 text-gray-400" />
                    ${entryFee} Entry
                  </div>
                ) : (
                  <div className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-cyan-400 ml-2 bg-cyan-500/10 border border-cyan-500/20">
                    <Trophy className="h-3 w-3 mr-1.5 text-cyan-400" />
                    Free Entry
                  </div>
                )}
              </div>

              {/* View Details Button */}
              <div className="mt-auto space-y-3">
                <Link
                  to={`/tournaments/${id}`}
                  className="group block w-full text-center text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: `2px solid rgba(${colors.primary}, 0.6)` 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </Link>
                <p className="text-center text-xs text-gray-500 mt-2">Click card to view organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            ...cardStyles
          }}
          onClick={handleCardClick}
        >
          <div className="relative overflow-hidden rounded-xl h-full backdrop-blur-sm bg-black/20">
            {/* Border with color accent */}
            <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
            
            {/* Accent color bar at top */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.primary}, 0.4))`,
              }}
            ></div>
            
            <div className="p-6 h-full flex flex-col">
              {/* Organizer Profile */}
              <div className="flex items-center mb-6 pb-5 border-b border-white/5">
                <Link 
                  to={organizerProfileLink} 
                  className="hover:opacity-80 transition-opacity duration-200 mr-5"
                  onMouseDown={(e) => {
                    e.stopPropagation(); 
                  }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                  }}
                >                  <img 
                    src={organizer.avatar || defaultAvatar}
                    alt={organizer.username}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                      e.currentTarget.onerror = null;
                    }}
                  />
                </Link>
                <div className="flex-1">
                  <Link 
                    to={organizerProfileLink} 
                    className="hover:opacity-80 transition-opacity duration-200 block"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                    }}
                  >                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span 
                        className="inline-block w-1 h-5 rounded-full"
                        style={{ background: `rgba(${colors.primary}, 0.8)` }}
                      ></span>
                      {organizer.username}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">Tournament Organizer</p>
                </div>
              </div>              {/* Organizer Bio */}
              <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/5">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">About</h4>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 overflow-hidden">
                  {organizer.bio && organizer.bio.length > 120 
                    ? `${organizer.bio.substring(0, 120)}...` 
                    : organizer.bio || 'No bio available.'
                  }
                </p>
              </div>{/* Social Links */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Connect</h4>
                <div className="flex flex-wrap gap-2">
                  {organizer.socials?.instagram && (
                    <a 
                      href={organizer.socials.instagram.startsWith('http') ? organizer.socials.instagram : `https://instagram.com/${organizer.socials.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />
                    </a>
                  )}
                  {organizer.socials?.twitter && (
                    <a 
                      href={organizer.socials.twitter.startsWith('http') ? organizer.socials.twitter : `https://twitter.com/${organizer.socials.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="Twitter"
                    >
                      <Twitter className="h-4 w-4 text-cyan-400" />
                    </a>
                  )}
                  {organizer.socials?.soundcloud && (
                    <a 
                      href={organizer.socials.soundcloud.startsWith('http') ? organizer.socials.soundcloud : `https://soundcloud.com/${organizer.socials.soundcloud}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="SoundCloud"
                    >
                      <Music className="h-4 w-4 text-orange-400" />
                    </a>
                  )}
                  {organizer.socials?.spotify && (
                    <a 
                      href={organizer.socials.spotify.startsWith('http') ? organizer.socials.spotify : `https://open.spotify.com/artist/${organizer.socials.spotify}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="Spotify"
                    >
                      <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                  )}
                  {organizer.socials?.youtube && (
                    <a 
                      href={organizer.socials.youtube.startsWith('http') ? organizer.socials.youtube : `https://youtube.com/${organizer.socials.youtube}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="YouTube"
                    >
                      <Youtube className="h-4 w-4 text-red-400" />
                    </a>
                  )}
                  {organizer.website && (
                    <a 
                      href={organizer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                      title="Website"
                    >
                      <Globe className="h-4 w-4 text-purple-400" />
                    </a>
                  )}
                </div>
                {(!organizer.socials?.instagram && !organizer.socials?.twitter && !organizer.website && !organizer.socials?.soundcloud && !organizer.socials?.spotify && !organizer.socials?.youtube) && (
                  <p className="text-xs text-gray-500">No social links available</p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-auto space-y-3">                <Link
                  to={organizerProfileLink}
                  className="group block w-full text-center text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20 relative z-10"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: `2px solid rgba(${colors.primary}, 0.6)` 
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  View Profile
                </Link>
                <p className="text-center text-xs text-gray-500 mt-2">Click anywhere to flip back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TournamentCard;