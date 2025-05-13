import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, Music, Trophy, Users, Calendar, DollarSign, Award } from 'lucide-react';

// Add styles for particle animation
const styles = `
  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(10px, -10px) rotate(5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

interface TournamentHeaderProps {
  title: string;
  genre: string;
  language: string;
  status: string;
  daysLeft: number;
  coverImage: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  colors: { primary: string; secondary: string; accent: string };
  startDate?: string;
  endDate?: string;
  entryFee?: number;
  difficulty?: string;
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  title,
  genre,
  language,
  status,
  daysLeft,
  coverImage,
  prizePool,
  participants,
  maxParticipants,
  colors,
  startDate = "2023-12-01",
  endDate = "2023-12-31",
  entryFee = 25,
  difficulty = "Advanced"
}) => {
  // Get status display styles
  const getStatusStyles = () => {
    if (status === 'Open') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (status === 'In Progress') {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    } else if (status === 'Completed') {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else {
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusTextColorClass = () => {
    if (status === 'Open') return 'text-emerald-300';
    if (status === 'In Progress') return 'text-cyan-300';
    if (status === 'Completed') return 'text-purple-300';
    return 'text-gray-300';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative z-10 py-4">
      <style>{styles}</style>
      
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        {/* Cover image with overlay */}
        <div className="relative h-44 md:h-56">
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover object-center opacity-50"
          />
          
          {/* Back button - repositioned to top-left of cover image */}
          <div className="absolute top-4 left-4 z-20">
            <Link to="/tournaments" className="inline-flex items-center text-white text-sm px-3 py-2 bg-black/40 rounded-lg backdrop-blur-sm hover:bg-black/60 transition-colors group">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="relative">
                Back to Tournaments
              </span>
            </Link>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `rgba(${colors.primary}, ${Math.random() * 0.3 + 0.1})`,
                  boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${colors.primary}, 0.3)`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Centered title inside the cover image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl text-center font-bold mb-1.5" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: 'white',
              textShadow: `0 0 20px rgba(${colors.primary}, 0.4), 0 0 40px rgba(${colors.primary}, 0.2)`,
              letterSpacing: '4px'
            }}>
              {title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xl">
              <div 
                className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full text-white bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/40 transition-colors"
                style={{ boxShadow: `0 0 10px rgba(0,0,0,0.2)` }}
              >
                <Music className="h-2.5 w-2.5 mr-1" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                <span className="text-2xs tracking-wide">{genre}</span>
              </div>
              
              <div className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full text-white bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/40 transition-colors"
                style={{ boxShadow: `0 0 10px rgba(0,0,0,0.2)` }}
              >
                <Globe className="h-2.5 w-2.5 mr-1 text-gray-400" />
                <span className="text-2xs tracking-wide">{language}</span>
              </div>

              <div 
                className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border-white/5 hover:bg-black/40 transition-colors bg-black/30 backdrop-blur-sm"
                style={{ 
                  boxShadow: status === 'Open' ? `0 0 10px rgba(16,185,129,0.2)` : 
                             status === 'In Progress' ? `0 0 10px rgba(6,182,212,0.2)` : 
                             status === 'Completed' ? `0 0 10px rgba(168,85,247,0.2)` : 
                             `0 0 10px rgba(0,0,0,0.2)` 
                }}
              >
                <span className={`text-2xs tracking-wide ${getStatusTextColorClass()}`}>
                  {status}
                </span>
              </div>

              {daysLeft > 0 && status !== 'Completed' && (
                <div 
                  className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full text-white bg-black/30 backdrop-blur-sm border border-white/5 hover:bg-black/40 transition-colors"
                  style={{ boxShadow: `0 0 10px rgba(0,0,0,0.2)` }}
                >
                  <Clock className="h-2.5 w-2.5 mr-1 text-pink-400" />
                  <span className="text-2xs tracking-wide">{daysLeft}d left</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gradient accent line */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
          }}
        ></div>

        <div className="p-3 md:p-4 pt-3">
          {/* All Stats in a Single Row */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Players */}
              <div className="text-center py-2">
                <Users className="h-5 w-5 mx-auto mb-0.5 text-cyan-400" />
                <span className="block text-2xs text-gray-400 uppercase tracking-wider leading-tight">Players</span>
                <span className="block text-sm font-semibold text-white leading-tight">{participants} / {maxParticipants}</span>
              </div>

              {/* Entry Fee */}
              <div className="text-center py-2">
                <DollarSign className="h-5 w-5 mx-auto mb-0.5 text-green-400" />
                <span className="block text-2xs text-gray-400 uppercase tracking-wider leading-tight">Entry Fee</span>
                <span className="block text-sm font-semibold text-white leading-tight">
                  {entryFee > 0 ? `$${entryFee}` : 'Free'}
                </span>
              </div>

              {/* Join Button or Status */}
              {status === 'Open' ? (
                <div className="flex items-center justify-center h-full">
                  <button 
                    className="w-full py-2.5 px-3 rounded-lg font-semibold text-white transition-all duration-200 text-sm flex items-center justify-center filter hover:brightness-110 active:brightness-95"
                    style={{
                      background: `linear-gradient(135deg, rgba(${colors.primary}, 0.6), rgba(${colors.secondary}, 0.5))`,
                      border: `1px solid rgba(${colors.primary}, 0.4)`,
                      boxShadow: `0 2px 8px rgba(${colors.primary}, 0.25)`
                    }}
                  >
                    Join Tournament
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  {/* Optional: Add an icon for status, e.g., Info, CheckCircle */}
                  {/* <Info className="h-5 w-5 mx-auto mb-0.5 text-gray-400" /> */}
                  <span className="block text-2xs text-gray-400 uppercase tracking-wider leading-tight">Status</span>
                  <span className={`block text-sm font-semibold leading-tight ${getStatusTextColorClass()}`}>
                    {status}
                  </span>
                </div>
              )}
              
              {/* Tournament Dates */}
              <div className="text-center py-2">
                <Calendar className="h-5 w-5 mx-auto mb-0.5 text-purple-400" />
                <span className="block text-2xs text-gray-400 uppercase tracking-wider leading-tight">Dates</span>
                <span className="block text-xs font-medium text-white leading-tight">
                  {formatDate(startDate)}
                </span>
                <span className="block text-xs font-medium text-white leading-tight">
                  {formatDate(endDate)}
                </span>
              </div>

              {/* Prize Pool */}
              <div className="text-center py-2">
                <Trophy className="h-5 w-5 mx-auto mb-0.5 text-pink-400" />
                <span className="block text-2xs text-gray-400 uppercase tracking-wider leading-tight">Prize Pool</span>
                <span className="block text-sm font-semibold text-white leading-tight">${prizePool.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHeader;