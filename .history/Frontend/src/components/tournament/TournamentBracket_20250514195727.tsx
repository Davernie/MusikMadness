import React from 'react';
import { Trophy } from 'lucide-react';

interface Participant {
  name: string;
  avatar?: string;
}

interface MatchParticipant extends Participant {
  score?: number;
  isWinner?: boolean;
  rarity?: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: [MatchParticipant, MatchParticipant];
}

interface TournamentBracketProps {
  matches: Match[];
  colors?: { 
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Reusable MatchCard component for each matchup
const MatchCard: React.FC<{ match: Match; colors: TournamentBracketProps['colors'] }> = ({ match, colors }) => {
  const [player1, player2] = match.participants;
  const defaultColors = {
    primary: '147, 51, 234',   // Default purple from your color scheme
    secondary: '147, 51, 234',
    accent: '147, 51, 234'
  };

  const themeColors = colors || defaultColors;

  return (
    <div className="relative flex flex-col gap-2">
      {/* Player 1 Card */}
      <div className={`relative p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
        player1.isWinner ? 'bg-white/10' : 'bg-black/30'
      }`}
      style={{
        borderLeft: player1.isWinner ? `2px solid rgba(${themeColors.primary}, 0.8)` : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {player1.isWinner && (
              <Trophy 
                className="h-4 w-4 text-yellow-400"
                style={{ filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.3))' }}
              />
            )}
            <div className="flex flex-col">
              <span className={`font-medium ${player1.isWinner ? 'text-white' : 'text-gray-300'}`}>
                {player1.name}
              </span>
              {player1.score && (
                <span className="text-xs text-gray-400">{player1.score}% votes</span>
              )}
            </div>
          </div>
        </div>
        {player1.rarity && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {player1.rarity}
          </span>
        )}
      </div>

      {/* Player 2 Card */}
      <div className={`relative p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
        player2.isWinner ? 'bg-white/10' : 'bg-black/30'
      }`}
      style={{
        borderLeft: player2.isWinner ? `2px solid rgba(${themeColors.primary}, 0.8)` : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {player2.isWinner && (
              <Trophy 
                className="h-4 w-4 text-yellow-400"
                style={{ filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.3))' }}
              />
            )}
            <div className="flex flex-col">
              <span className={`font-medium ${player2.isWinner ? 'text-white' : 'text-gray-300'}`}>
                {player2.name}
              </span>
              {player2.score && (
                <span className="text-xs text-gray-400">{player2.score}% votes</span>
              )}
            </div>
          </div>
        </div>
        {player2.rarity && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {player2.rarity}
          </span>
        )}
      </div>

      {/* Victory percentage for winner */}
      {(player1.isWinner || player2.isWinner) && (player1.score || player2.score) && (
        <div className="absolute -right-24 top-1/2 -translate-y-1/2">
          <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            {player1.isWinner ? player1.score : player2.score}% Victory
          </div>
        </div>
      )}
    </div>
  );
};

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, colors }) => {
  // Group matches by rounds
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort();
  const defaultColors = {
    primary: '147, 51, 234',   // Default purple from your color scheme
    secondary: '147, 51, 234',
    accent: '147, 51, 234'
  };

  const themeColors = colors || defaultColors;

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="relative">
        {/* Tournament logo and title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-8 text-center">
          <img 
            src="/src/assets/images/image_transparent.png" 
            alt="MusikMadness" 
            className="h-16 mx-auto mb-4"
          />
          <h2 className="text-2xl" style={{ 
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: `rgb(${themeColors.primary})`,
            textShadow: `0 0 10px rgba(${themeColors.primary}, 0.1), 0 0 20px rgba(${themeColors.primary}, 0.1)`,
            letterSpacing: '3px'
          }}>
            Tournament Bracket
          </h2>
        </div>

        {/* Main bracket container */}
        <div className="mt-20 relative bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/5 p-8">
          {/* Gradient accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(to right, rgba(${themeColors.primary}, 0.8), rgba(${themeColors.secondary}, 0.4), rgba(${themeColors.accent}, 0.2))`
            }}
          ></div>

          {/* Rounds */}
          <div className="flex justify-between gap-16 min-w-[800px] relative">
            {rounds.map((round) => (
              <div key={round} className="flex-1">
                {/* Round title */}
                <div 
                  className="mb-6 text-center py-2 px-4 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, rgba(${themeColors.primary}, 0.1), rgba(0,0,0,0.3))`,
                    border: `1px solid rgba(${themeColors.primary}, 0.2)`
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: `rgba(${themeColors.primary}, 0.9)` }}>
                    {round === 1 ? 'Quarter Finals' : 
                     round === 2 ? 'Semi Finals' : 
                     round === 3 ? 'Finals' : `Round ${round}`}
                  </span>
                </div>

                {/* Matches in this round */}
                <div className="space-y-8">
                  {matchesByRound[round].map((match) => (
                    <MatchCard key={match.id} match={match} colors={themeColors} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
