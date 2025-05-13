import React from 'react';
import { Trophy } from 'lucide-react';

interface Participant {
  name: string;
  avatar?: string;
}

interface MatchParticipant extends Participant {
  score?: number;
  isWinner?: boolean;
}

interface Match {
  id: string;
  participants: MatchParticipant[];
  round: number;
  matchNumber: number;
  completed: boolean;
}

interface TournamentBracketProps {
  title: string;
  colors: { primary: string; secondary: string; accent: string };
  matches?: Match[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  title,
  colors,
  matches = []
}) => {
  // Generate some sample matches if none provided
  const sampleMatches: Match[] = matches.length > 0 ? matches : [
    // Round 1 (Quarter Finals)
    { id: '1', participants: [{ name: 'Alex Johnson', score: 85, isWinner: true }, { name: 'Maria Garcia', score: 78 }], round: 1, matchNumber: 1, completed: true },
    { id: '2', participants: [{ name: 'James Wilson', score: 92, isWinner: true }, { name: 'Sarah Lee', score: 88 }], round: 1, matchNumber: 2, completed: true },
    { id: '3', participants: [{ name: 'David Kim', score: 76 }, { name: 'Emma Davis', score: 81, isWinner: true }], round: 1, matchNumber: 3, completed: true },
    { id: '4', participants: [{ name: 'Michael Brown', score: 89, isWinner: true }, { name: 'Olivia Taylor', score: 84 }], round: 1, matchNumber: 4, completed: true },
    
    // Round 2 (Semi Finals)
    { id: '5', participants: [{ name: 'Alex Johnson', score: 88 }, { name: 'James Wilson', score: 91, isWinner: true }], round: 2, matchNumber: 1, completed: true },
    { id: '6', participants: [{ name: 'Emma Davis', score: 86 }, { name: 'Michael Brown', score: 90, isWinner: true }], round: 2, matchNumber: 2, completed: true },
    
    // Round 3 (Finals)
    { id: '7', participants: [{ name: 'James Wilson', score: 94, isWinner: true }, { name: 'Michael Brown', score: 92 }], round: 3, matchNumber: 1, completed: true },
  ];

  // Group matches by round
  const matchesByRound = sampleMatches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort();
  const maxRound = Math.max(...rounds);

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      {/* Gradient accent line */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
        }}
      ></div>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-white flex items-center mb-5">
          <span 
            className="inline-block w-1 h-5 rounded-full mr-3"
            style={{ background: `rgba(${colors.primary}, 0.8)` }}
          ></span>
          Tournament Bracket
        </h2>
        
        {/* Add CSS for connector lines */}
        <style>
          {`
            .match-connector::after {
              content: '';
              position: absolute;
              top: 50%;
              right: -16px;
              width: 16px;
              height: 2px;
              background-color: rgba(${colors.primary}, 0.3);
              z-index: 1;
            }
          `}
        </style>
        
        <div className="relative overflow-x-auto">
          <div className="flex justify-between min-w-[800px]">
            {rounds.map((round) => (
              <div key={round} className="flex-1 px-2">
                <div 
                  className="text-sm font-semibold text-center mb-4 py-2 rounded-md"
                  style={{ 
                    background: `rgba(${colors.primary}, 0.15)`,
                    color: `rgba(${colors.primary}, 0.9)`
                  }}
                >
                  {round === 1 ? 'Quarter Finals' : 
                   round === 2 ? 'Semi Finals' : 
                   round === 3 ? 'Finals' : `Round ${round}`}
                </div>
                
                <div className="space-y-8">
                  {matchesByRound[round].map((match) => (
                    <div 
                      key={match.id} 
                      className={`bg-black/40 backdrop-blur-sm rounded-lg border p-3 relative ${
                        round < maxRound ? 'match-connector' : ''
                      }`}
                      style={{ 
                        borderColor: match.completed ? `rgba(${colors.primary}, 0.3)` : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {match.participants.map((participant, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 ${
                            idx === 0 ? 'mb-2' : ''
                          } ${
                            participant.isWinner ? 'bg-opacity-20 rounded-md' : ''
                          }`}
                          style={{ 
                            backgroundColor: participant.isWinner ? `rgba(${colors.primary}, 0.1)` : 'transparent',
                            borderLeft: participant.isWinner ? `2px solid rgba(${colors.primary}, 0.8)` : 'none'
                          }}
                        >
                          <div className="flex items-center">
                            {participant.isWinner && (
                              <Trophy className="h-3 w-3 mr-2" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
                            )}
                            <span className={`text-sm ${participant.isWinner ? 'font-semibold text-white' : 'text-gray-400'}`}>
                              {participant.name}
                            </span>
                          </div>
                          {participant.score !== undefined && (
                            <span 
                              className={`text-sm font-medium ${participant.isWinner ? 'text-white' : 'text-gray-400'}`}
                            >
                              {participant.score}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Winner celebration for the final match */}
        {sampleMatches.find(m => m.round === maxRound)?.participants.find(p => p.isWinner) && (
          <div 
            className="mt-8 p-4 rounded-lg text-center border"
            style={{ 
              background: `linear-gradient(135deg, rgba(${colors.primary}, 0.1), rgba(0, 0, 0, 0.4))`,
              borderColor: `rgba(${colors.primary}, 0.3)`
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 mr-2" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
              <h3 className="text-lg font-bold text-white">Tournament Champion</h3>
            </div>
            <p 
              className="text-xl font-semibold"
              style={{ color: `rgba(${colors.primary}, 0.9)` }}
            >
              {sampleMatches.find(m => m.round === maxRound)?.participants.find(p => p.isWinner)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentBracket; 