import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, Music, CalendarDays, Trophy, Users } from 'lucide-react';

interface TournamentHeaderProps {
  title: string;
  genre: string;
  language: string;
  status: string;
  daysLeft: number;
  colors: { primary: string; secondary: string; accent: string };
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  title,
  genre,
  language,
  status,
  daysLeft,
  colors
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
  
  return (
    <div className="relative z-10 py-6">
      <Link to="/tournaments" className="inline-flex items-center text-gray-300 text-sm mb-4 hover:text-cyan-400 transition-colors group">
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span className="relative">
          Back to Tournaments
          <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
        </span>
      </Link>
      
      <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        {/* Gradient accent line */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
          }}
        ></div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center">
                <span 
                  className="inline-block w-1.5 h-8 rounded-full mr-3"
                  style={{ 
                    background: `rgba(${colors.primary}, 0.8)`,
                    boxShadow: `0 0 15px rgba(${colors.primary}, 0.4)`
                  }}
                ></span>
                {title}
              </h1>
              
              <div className="mt-4 text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl">
                A premium music tournament showcasing incredible {genre} talent. Join hundreds of musicians in this exclusive competition.
              </div>
            </div>
            
            {/* Highlight box */}
            <div 
              className="rounded-xl p-4 border flex items-center gap-3 flex-shrink-0 w-full lg:w-auto"
              style={{
                borderColor: `rgba(${colors.primary}, 0.3)`,
                background: `linear-gradient(135deg, rgba(${colors.primary}, 0.1), rgba(0, 0, 0, 0.4))`,
              }}
            >
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `rgba(${colors.primary}, 0.15)`,
                  border: `1px solid rgba(${colors.primary}, 0.3)`,
                }}
              >
                <Trophy className="h-6 w-6" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Tournament Status</div>
                <div className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                  <span 
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${getStatusStyles()}`}
                  >
                    {status}
                  </span>
                  {daysLeft > 0 && status !== 'Completed' && (
                    <span className="inline-flex items-center text-xs font-medium">
                      <Clock className="h-3 w-3 mr-1.5 text-pink-400" />
                      {daysLeft} days left
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div 
              className="inline-flex items-center text-xs font-medium px-4 py-2 rounded-lg text-white"
              style={{ 
                background: `rgba(${colors.primary}, 0.15)`, 
                border: `1px solid rgba(${colors.primary}, 0.3)`,
                boxShadow: `0 0 10px rgba(${colors.primary}, 0.1)`
              }}
            >
              <Music className="h-3.5 w-3.5 mr-2" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
              {genre}
            </div>
            
            <div className="inline-flex items-center text-xs font-medium px-4 py-2 rounded-lg text-white bg-white/5 border border-white/10">
              <Globe className="h-3.5 w-3.5 mr-2 text-gray-400" />
              {language}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHeader; 