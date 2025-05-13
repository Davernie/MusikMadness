import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, Music, Trophy, Users, Calendar, DollarSign, Award, CheckCircle } from 'lucide-react';

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

          {/* Open status indicator - top right */}
          {status === 'Open' && (
            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-500/30">
                <CheckCircle className="h-4 w-4 text-emerald-400 mr-1.5" />
                <span className="text-xs font-medium text-emerald-300">Open for Entry</span>
              </div>
            </div>
          )}
          
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
            <h1 className="text-2xl md:text-4xl lg:text-5xl text-center font-bold" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              background: `linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.8))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 5px rgba(0,0,0,0.3)`,
              letterSpacing: '3px',
              filter: `drop-shadow(0 0 8px rgba(${colors.primary}, 0.2))`
            }}>
              {title}
            </h1>
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
              <div className="relative overflow-hidden rounded-lg p-2.5 group transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: `linear-gradient(145deg, rgba(25,30,40,0.6), rgba(15,20,30,0.8))`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                }}
              >
                <div className="absolute -right-6 top-0 w-12 h-12 rounded-full opacity-20 blur-xl bg-cyan-500/40"></div>
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span className="ml-1.5 text-2xs font-medium text-gray-400 uppercase tracking-wider leading-none">Players</span>
                </div>
                <div className="flex items-baseline justify-center text-center">
                  <span className="text-lg font-bold text-white leading-none mr-1">{participants}</span>
                  <span className="text-xs text-cyan-300/70">/ {maxParticipants}</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/60 to-transparent"></div>
              </div>

              {/* Entry Fee */}
              <div className="relative overflow-hidden rounded-lg p-2.5 group transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: `linear-gradient(145deg, rgba(25,30,40,0.6), rgba(15,20,30,0.8))`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                }}
              >
                <div className="absolute -right-6 top-0 w-12 h-12 rounded-full opacity-20 blur-xl bg-green-500/40"></div>
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="ml-1.5 text-2xs font-medium text-gray-400 uppercase tracking-wider leading-none">Entry Fee</span>
                </div>
                <div className="text-lg font-bold text-white leading-none text-center">
                  {entryFee > 0 ? `$${entryFee}` : 'Free'}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400/60 to-transparent"></div>
              </div>

              {/* Join Button or Status - keep this as is since it's a button */}
              {status === 'Open' ? (
                <div className="relative flex items-center justify-center h-full">
                  <button 
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 relative group"
                    style={{
                      background: `linear-gradient(135deg, rgba(${colors.primary}, 0.7), rgba(${colors.secondary}, 0.6))`,
                      boxShadow: `0 4px 15px rgba(${colors.primary}, 0.3), 0 0 0 1px rgba(${colors.primary}, 0.4)`,
                      overflow: 'hidden'
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" style={{filter: "drop-shadow(0 0 2px rgba(255,255,255,0.4))"}} />
                      Join Tournament
                    </span>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, rgba(${colors.primary}, 0.9), rgba(${colors.secondary}, 0.8))`,
                      }}
                    ></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  </button>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg p-2.5 group transition-all duration-300 hover:translate-y-[-2px]"
                  style={{
                    background: `linear-gradient(145deg, rgba(25,30,40,0.6), rgba(15,20,30,0.8))`,
                    boxShadow: `0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                  }}
                >
                  <div className="absolute -right-6 top-0 w-12 h-12 rounded-full opacity-20 blur-xl" 
                    style={{ 
                      backgroundColor: status === 'Completed' ? 'rgba(168,85,247,0.4)' : 
                                      status === 'In Progress' ? 'rgba(6,182,212,0.4)' : 'rgba(209,213,219,0.4)'
                    }}
                  ></div>
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4" className={getStatusTextColorClass()} />
                    <span className="ml-1.5 text-2xs font-medium text-gray-400 uppercase tracking-wider leading-none">Status</span>
                  </div>
                  <div className={`text-lg font-bold leading-none ${getStatusTextColorClass()} text-center`}>
                    {status}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5" 
                    style={{ 
                      background: status === 'Completed' ? 'linear-gradient(to right, rgba(168,85,247,0.6), transparent)' : 
                                status === 'In Progress' ? 'linear-gradient(to right, rgba(6,182,212,0.6), transparent)' : 
                                'linear-gradient(to right, rgba(209,213,219,0.6), transparent)'
                    }}
                  ></div>
                </div>
              )}
              
              {/* Tournament Dates */}
              <div className="relative overflow-hidden rounded-lg p-2.5 group transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: `linear-gradient(145deg, rgba(25,30,40,0.6), rgba(15,20,30,0.8))`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                }}
              >
                <div className="absolute -right-6 top-0 w-12 h-12 rounded-full opacity-20 blur-xl bg-purple-500/40"></div>
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="ml-1.5 text-2xs font-medium text-gray-400 uppercase tracking-wider leading-none">Start Date</span>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-lg font-bold text-white leading-none">
                    {formatDate(startDate).replace(', 2023', '')}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400/60 to-transparent"></div>
              </div>

              {/* Prize Pool */}
              <div className="relative overflow-hidden rounded-lg p-2.5 group transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: `linear-gradient(145deg, rgba(25,30,40,0.6), rgba(15,20,30,0.8))`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                }}
              >
                <div className="absolute -right-6 top-0 w-12 h-12 rounded-full opacity-20 blur-xl bg-pink-500/40"></div>
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-4 w-4 text-pink-400" />
                  <span className="ml-1.5 text-2xs font-medium text-gray-400 uppercase tracking-wider leading-none">Prize Pool</span>
                </div>
                <div className="text-lg font-bold text-white leading-none text-center">${prizePool.toLocaleString()}</div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHeader;