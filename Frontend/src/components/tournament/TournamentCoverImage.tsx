import React from 'react';
import { Image } from 'lucide-react';

interface TournamentCoverImageProps {
  coverImage: string;
  title: string;
  colors: { primary: string; secondary: string; accent: string };
}

const TournamentCoverImage: React.FC<TournamentCoverImageProps> = ({
  coverImage,
  title,
  colors
}) => {
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      {/* Gradient accent line */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
        }}
      ></div>
      
      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl aspect-[16/9] group">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl" 
              style={{ 
                border: `1px solid rgba(${colors.primary}, 0.3)`,
                background: `linear-gradient(135deg, rgba(${colors.primary}, 0.1), rgba(0, 0, 0, 0.4))`,
              }}
            >
              <Image className="h-16 w-16 text-gray-600" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)`,
            }}
          ></div>
          
          {/* Glowing corners on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 30px rgba(${colors.primary}, 0.2)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCoverImage; 