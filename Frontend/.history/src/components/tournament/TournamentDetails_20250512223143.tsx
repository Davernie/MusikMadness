import React from 'react';
import { Calendar, Trophy, Users } from 'lucide-react';

interface TournamentDetailsProps {
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  colors: { primary: string; secondary: string; accent: string };
  formatShortDate: (date: string) => string;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({
  startDate,
  endDate,
  prizePool,
  participants,
  maxParticipants,
  entryFee,
  colors,
  formatShortDate
}) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
      {/* Accent color bar at top */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.primary}, 0.4))`,
        }}
      ></div>
        
      <div className="p-6">
        <h3 className="text-lg mb-5" style={{ 
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: `rgb(${colors.primary})`,
            textShadow: `0 0 10px rgba(${colors.primary}, 0.1), 0 0 20px rgba(${colors.primary}, 0.1)`,
            letterSpacing: '3px'
          }}>
          Tournament Details
        </h3>
        
        <div className="space-y-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 mr-3 border border-white/10">
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Tournament Dates</h4>
              <p className="text-xs text-gray-400 mt-1">Starts: {formatShortDate(startDate)}</p>
              <p className="text-xs text-gray-400">Ends: {formatShortDate(endDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 mr-3 border border-white/10">
              <Trophy className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Prize Pool</h4>
              <p className="text-xs text-gray-400 mt-1">${prizePool} distributed among winners</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 mr-3 border border-white/10">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Participants</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${(participants / maxParticipants) * 100}%`,
                      background: `rgba(${colors.primary}, 0.6)` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">{participants}/{maxParticipants}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 mr-3 border border-white/10">
              <span className="text-yellow-400 text-sm font-bold">$</span>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Entry Fee</h4>
              {entryFee > 0 ? (
                <p className="text-xs text-gray-400 mt-1">${entryFee} per participant</p>
              ) : (
                <p className="text-xs text-cyan-400 mt-1">Free Entry</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;