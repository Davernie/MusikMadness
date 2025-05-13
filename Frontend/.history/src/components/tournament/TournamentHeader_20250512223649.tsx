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
    <div className="relative z-10 py-6">
      <style>{styles}</style>
      
      <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        {/* Cover image with overlay */}
        <div className="relative h-48 md:h-64">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl text-center font-bold mb-2" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: 'white',
              textShadow: `0 0 20px rgba(${colors.primary}, 0.4), 0 0 40px rgba(${colors.primary}, 0.2)`,
              letterSpacing: '4px'
            }}>
              {title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              <div 
                className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-black/40 backdrop-blur-sm border border-white/10"
              >
                <Music className="h-4 w-4 mr-2" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                {genre}
              </div>
              
              <div className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-black/40 backdrop-blur-sm border border-white/10">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                {language}
              </div>

              <span className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg border bg-black/40 backdrop-blur-sm ${getStatusStyles()}`}>
                {status}
              </span>

              {daysLeft > 0 && status !== 'Completed' && (
                <div 
                  className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg text-white bg-black/40 backdrop-blur-sm border border-white/10"
                >
                  <Clock className="h-4 w-4 mr-2 text-pink-400" />
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

        <div className="p-4 md:p-6 pt-4">
          {/* All Stats in a Single Row */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Players */}
              <div 
                className="relative overflow-hidden bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 20px rgba(${colors.secondary}, 0.1)` }}
              >
                <div 
                  className="absolute -right-6 -top-6 w-16 h-16 rounded-full blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, rgba(${colors.secondary}, 0.2) 0%, rgba(${colors.secondary}, 0) 70%)` }}
                ></div>
                <Users className="h-6 w-6 mb-1 text-cyan-400" />
                <span className="text-sm text-gray-400 mb-1">Players</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-bold text-white">{participants}</span>
                  <span className="text-xs text-gray-400">/ {maxParticipants}</span>
                </div>
              </div>

              {/* Entry Fee */}
              <div 
                className="relative overflow-hidden bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 20px rgba(${colors.secondary}, 0.1)` }}
              >
                <DollarSign className="h-6 w-6 mb-1 text-green-400" />
                <span className="text-sm text-gray-400 mb-1">Entry Fee</span>
                <div className="text-xl font-bold text-white">
                  {entryFee > 0 ? `$${entryFee}` : 'Free'}
                </div>
              </div>

              {/* Join Button or Status */}
              {status === 'Open' ? (
                <div className="flex items-center justify-center">
                  <button 
                    className="relative overflow-hidden py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98] w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, rgba(${colors.primary}, 0.4), rgba(${colors.secondary}, 0.4))`,
                      border: `1px solid rgba(${colors.primary}, 0.3)`,
                      boxShadow: `0 0 20px rgba(${colors.primary}, 0.2)`
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r transition-opacity duration-300 opacity-0 hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, rgba(${colors.primary}, 0.6), rgba(${colors.secondary}, 0.6))`
                      }}
                    ></div>
                    <span className="relative text-md">Join Tournament</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="relative overflow-hidden bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                  style={{ boxShadow: `0 0 20px rgba(${colors.secondary}, 0.1)` }}
                >
                  <div className="text-sm text-gray-400 mb-1">Tournament Status</div>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${getStatusStyles()}`}>
                    <span className="text-md font-medium">{status}</span>
                  </div>
                </div>
              )}
              
              {/* Tournament Dates */}
              <div 
                className="relative overflow-hidden bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 20px rgba(${colors.primary}, 0.1)` }}
              >
                <Calendar className="h-6 w-6 mb-1 text-purple-400" />
                <span className="text-sm text-gray-400 mb-1">Tournament Dates</span>
                <div className="text-xs font-medium text-white">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </div>
              </div>

              {/* Prize Pool */}
              <div 
                className="relative overflow-hidden bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 group transition-all duration-300 hover:border-white/20 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: `0 0 20px rgba(${colors.primary}, 0.1)` }}
              >
                <div 
                  className="absolute -right-6 -top-6 w-16 h-16 rounded-full blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, rgba(${colors.primary}, 0.2) 0%, rgba(${colors.primary}, 0) 70%)` }}
                ></div>
                <Trophy className="h-6 w-6 mb-1 text-pink-400" />
                <span className="text-sm text-gray-400 mb-1">Prize Pool</span>
                <div className="text-xl font-bold text-white">${prizePool.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHeader;