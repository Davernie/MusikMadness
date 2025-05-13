import React from 'react';
import { User, Instagram, Twitter, Globe, ShieldCheck } from 'lucide-react';

interface Organizer {
  name: string;
  avatar: string;
  bio: string;
}

interface OrganizerCardProps {
  organizer: Organizer;
  colors: { primary: string; secondary: string; accent: string };
  participants?: number;
  prizePool?: number;
}

const OrganizerCard: React.FC<OrganizerCardProps> = ({
  organizer,
  colors,
  participants = 0,
  prizePool = 0
}) => {
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
              src={organizer.avatar} 
              alt={organizer.name}
              className="w-14 h-14 rounded-full border border-white/20 object-cover group-hover:border-white/30 transition-all duration-300"
            />
            <div 
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white/10"
            >
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-white">{organizer.name}</h4>
            <p className="text-xs text-gray-400 mt-1">
              <User className="h-3 w-3 inline mr-1" />
              Professional Organizer
            </p>
          </div>
        </div>

        <div className="space-y-5 flex-grow">
          <div className="text-sm text-gray-300 leading-relaxed">
            {organizer.bio}
          </div>
          
          {/* Social links */}
          <div className="flex gap-3 pt-8 mt-auto">
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105">
              <Instagram className="h-4 w-4 text-pink-400" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105">
              <Twitter className="h-4 w-4 text-cyan-400" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:scale-105">
              <Globe className="h-4 w-4 text-purple-400" />
            </a>
          </div>
          
          {/* Contact action */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <button 
              className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 relative group"
              style={{
                background: `linear-gradient(135deg, rgba(${colors.primary}, 0.7), rgba(${colors.secondary}, 0.6))`,
                boxShadow: `0 4px 15px rgba(${colors.primary}, 0.3), 0 0 0 1px rgba(${colors.primary}, 0.4)`,
                overflow: 'hidden'
              }}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerCard;