import React from 'react';
import { User, MapPin } from 'lucide-react';

interface Participant {
  name: string;
  avatar: string;
  location: string;
}

interface TournamentParticipantCardProps {
  participant: Participant;
  colors: { primary: string; secondary: string; accent: string };
  index: number;
}

const TournamentParticipantCard: React.FC<TournamentParticipantCardProps> = ({
  participant,
  colors,
  index
}) => {
  // Create a subtle delay for staggered animations
  const animationDelay = `${(index % 10) * 0.05}s`;
  
  return (
    <div 
      className="group flex items-center p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 
               transition-all duration-300 hover:bg-white/5 hover:scale-[1.02]"
      style={{ animationDelay }}
    >
      {participant.avatar ? (
        <img
          src={participant.avatar}
          alt={participant.name}
          className="w-12 h-12 rounded-full border border-white/20 object-cover 
                   group-hover:border-opacity-100 transition-all duration-300"
          style={{ 
            borderColor: `rgba(${colors.primary}, 0.3)`,
            boxShadow: `0 0 0 rgba(${colors.primary}, 0), 
                        group-hover:0 0 10px rgba(${colors.primary}, 0.3)`
          }}
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full border border-white/20 
                   flex items-center justify-center bg-white/5
                   group-hover:border-opacity-100 transition-all duration-300"
          style={{ borderColor: `rgba(${colors.primary}, 0.3)` }}
        >
          <User className="h-6 w-6 text-gray-400" />
        </div>
      )}
      
      <div className="ml-3">
        <p className="font-medium text-white">{participant.name}</p>
        <p className="text-xs text-gray-400 flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {participant.location}
        </p>
      </div>
    </div>
  );
};

export default TournamentParticipantCard; 