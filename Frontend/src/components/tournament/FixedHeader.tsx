import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, Music, Calendar, Users, Award } from 'lucide-react';

interface FixedHeaderProps {
  title: string;
  coverImage: string;
  genre: string;
  language: string;
  status: string;
  daysLeft: number;
  colors: { primary: string; secondary: string; accent: string };
}

const FixedHeader: React.FC<FixedHeaderProps> = ({
  title,
  coverImage,
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
  
  // Generate floating particles based on genre color
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    opacity: Math.random() * 0.5 + 0.1
  }));
  
  return (
    <div className="relative z-10">
      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(20px, -20px);
            }
          }
          
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      
      <div className="relative h-80 overflow-hidden">
        {/* Cover image */}
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        
        {/* Floating particles overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: `rgba(${colors.primary}, ${particle.opacity})`,
                boxShadow: `0 0 ${particle.size * 2}px rgba(${colors.primary}, ${particle.opacity})`,
                animation: `float ${particle.animationDuration} ease-in-out ${particle.animationDelay} infinite alternate`,
                opacity: particle.opacity
              }}
            />
          ))}
        </div>
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay z-20 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px'
          }}
        ></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"></div>
        
        {/* Dynamic accent color gradient at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px]" 
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(${colors.primary}, 0.7) 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite linear'
          }}
        ></div>
        
        {/* Header content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/tournaments" className="inline-flex items-center text-gray-300 text-sm mb-4 hover:text-cyan-400 transition-colors group">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="relative">
                Back to Tournaments
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            <h1 className="text-4xl font-bold mb-4 text-white flex items-center">
              <span 
                className="inline-block w-1.5 h-8 rounded-full mr-3"
                style={{ 
                  background: `rgba(${colors.primary}, 0.8)`,
                  boxShadow: `0 0 15px rgba(${colors.primary}, 0.4)`
                }}
              ></span>
              {title}
            </h1>
            
            <div className="mb-5 text-gray-400 text-sm leading-relaxed max-w-2xl">
              A premium music tournament showcasing incredible {genre} talent. Join hundreds of musicians in this exclusive competition.
            </div>
            
            <div className="flex items-center flex-wrap gap-3">
              <div 
                className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{ 
                  background: `rgba(${colors.primary}, 0.15)`, 
                  border: `1px solid rgba(${colors.primary}, 0.3)`,
                  boxShadow: `0 0 10px rgba(${colors.primary}, 0.1)`
                }}
              >
                <Music className="h-3 w-3 mr-1.5" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                {genre}
              </div>
              
              <div className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-white bg-white/5 border border-white/10">
                <Globe className="h-3 w-3 mr-1.5 text-gray-400" />
                {language}
              </div>
              
              <div className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${getStatusStyles()}`}>
                {status}
              </div>
              
              {daysLeft > 0 && status !== 'Completed' && (
                <div className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full text-white bg-white/5 border border-white/10">
                  <Clock className="h-3 w-3 mr-1.5 text-pink-400" />
                  {daysLeft} days left
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedHeader; 