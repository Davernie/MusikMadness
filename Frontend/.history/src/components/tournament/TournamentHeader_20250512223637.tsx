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
        <div className="relative h-40 md:h-56">
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
            <h1 className="text-2xl md:text-4xl lg:text-5xl text-center font-bold mb-1" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: 'white',
              textShadow: `0 0 20px rgba(${colors.primary}, 0.4), 0 0 40px rgba(${colors.primary}, 0.2)`,
              letterSpacing: '4px'
            }}>
              {title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              <div 
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md text-white bg-black/40 backdrop-blur-sm border border-white/10"
              >
                <Music className="h-3 w-3 mr-1.5" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                {genre}
              </div>
              
              <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md text-white bg-black/40 backdrop-blur-sm border border-white/10">
                <Globe className="h-3 w-3 mr-1.5 text-gray-400" />
                {language}
              </div>

              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border bg-black/40 backdrop-blur-sm ${getStatusStyles()}`}>
                {status}
              </span>

              {daysLeft > 0 && status !== 'Completed' && (
                <div 
                  className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md text-white bg-black/40 backdrop-blur-sm border border-white/10"
                >
                  <Clock className="h-3 w-3 mr-1.5 text-pink-400" />
                  {daysLeft} days left
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {/* Players */}
              <div 
                className="relative overflow-hidden bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/10 p-2.5 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 15px rgba(${colors.secondary}, 0.05)` }}
              >
                <div 
                  className="absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, rgba(${colors.secondary}, 0.15) 0%, rgba(${colors.secondary}, 0) 70%)` }}
                ></div>
                <Users className="h-5 w-5 mb-0.5 text-cyan-400" />
                <span className="text-xs text-gray-400">Players</span>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-lg font-bold text-white">{participants}</span>
                  <span className="text-2xs text-gray-400">/ {maxParticipants}</span>
                </div>
              </div>

              {/* Entry Fee */}
              <div 
                className="relative overflow-hidden bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/10 p-2.5 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 15px rgba(${colors.secondary}, 0.05)` }}
              >
                <DollarSign className="h-5 w-5 mb-0.5 text-green-400" />
                <span className="text-xs text-gray-400">Entry Fee</span>
                <div className="text-lg font-bold text-white">
                  {entryFee > 0 ? `$${entryFee}` : 'Free'}
                </div>
              </div>

              {/* Join Button or Status */}
              {status === 'Open' ? (
                <div className="flex items-center justify-center">
                  <button 
                    className="relative overflow-hidden py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-300 bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98] w-full h-full flex items-center justify-center text-sm"
                    style={{
                      background: `linear-gradient(135deg, rgba(${colors.primary}, 0.3), rgba(${colors.secondary}, 0.3))`,
                      border: `1px solid rgba(${colors.primary}, 0.2)`,
                      boxShadow: `0 0 15px rgba(${colors.primary}, 0.15)`
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r transition-opacity duration-300 opacity-0 hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, rgba(${colors.primary}, 0.5), rgba(${colors.secondary}, 0.5))`
                      }}
                    ></div>
                    <span className="relative">Join Tournament</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="relative overflow-hidden bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/10 p-2.5 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                  style={{ boxShadow: `0 0 15px rgba(${colors.secondary}, 0.05)` }}
                >
                  <span className="text-xs text-gray-400 mb-0.5">Status</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-md border ${getStatusStyles()}`}>
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                </div>
              )}
              
              {/* Tournament Dates */}
              <div 
                className="relative overflow-hidden bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/10 p-2.5 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 15px rgba(${colors.primary}, 0.05)` }}
              >
                <Calendar className="h-5 w-5 mb-0.5 text-purple-400" />
                <span className="text-xs text-gray-400">Dates</span>
                <div className="text-2xs font-medium text-white leading-tight">
                  {formatDate(startDate)}<br/>{formatDate(endDate)}
                </div>
              </div>

              {/* Prize Pool */}
              <div 
                className="relative overflow-hidden bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/10 p-2.5 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 15px rgba(${colors.primary}, 0.05)` }}
              >
                <div 
                  className="absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, rgba(${colors.primary}, 0.15) 0%, rgba(${colors.primary}, 0) 70%)` }}
                ></div>
                <Trophy className="h-5 w-5 mb-0.5 text-pink-400" />
                <span className="text-xs text-gray-400">Prize Pool</span>
                <div className="text-lg font-bold text-white">${prizePool.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHeader;