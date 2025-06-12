import React, { useMemo } from 'react';
import styles from './TournamentBracket8.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament';

/**
 * TournamentBracket8 Component
 * 
 * A dedicated component for displaying 8-participant tournament brackets.
 * This component provides optimized layout and styling specifically for 8-bracket tournaments,
 * avoiding conflicts with other bracket sizes and ensuring clean visual presentation.
 * 
 * Features:
 * - 5-column grid layout optimized for 8 participants
 * - 3 rounds: Round 1 (4 matches), Round 2 (2 matches), Round 3 (1 match)
 * - Symmetric layout with semifinals and championship
 * - Responsive design with proper scaling across different screen sizes
 * - Support for BYE matchups and visual representation
 * - Integrated with backend bracket generation algorithm
 * 
 * Structure:
 * - Round 1: 4 matchups (8 -> 4 players)
 * - Round 2: 2 matchups (4 -> 2 players) [Semifinals]
 * - Round 3: 1 matchup (2 -> 1 player) [Championship]
 * 
 * Usage:
 * This component is automatically used when actualBracketSize === 8 is detected
 * in the main TournamentBracket component. No manual invocation needed.
 * 
 * Props:
 * @param participants - Array of tournament participants
 * @param generatedBracket - Array of FrontendBracketMatchup from backend generation
 */

interface TournamentBracket8Props {
  participants: Participant[];
  generatedBracket?: FrontendBracketMatchup[];
}

const TournamentBracket8: React.FC<TournamentBracket8Props> = ({ participants, generatedBracket }) => {
  const bracketDataToRender = useMemo(() => {
    return (generatedBracket && generatedBracket.length > 0) ? generatedBracket : [];
  }, [generatedBracket]);

  // Helper to get all matchups for a specific round number
  const getMatchupsForRound = (roundNumber: number): FrontendBracketMatchup[] => {
    return bracketDataToRender.filter(m => m.roundNumber === roundNumber);
  };

  if (bracketDataToRender.length === 0) {
    if (participants && participants.length > 0) {
      return (
        <div className="w-full text-center py-10 text-gray-400">
          Bracket will be generated when the tournament begins.
        </div>
      );
    }
    return <div className="w-full text-center py-10 text-gray-400">Bracket data is not available.</div>;
  }

  // Get matchups for each round (8-bracket has 3 rounds)
  const round1Matchups = getMatchupsForRound(1); // 4 matchups
  const round2Matchups = getMatchupsForRound(2); // 2 matchups (Semifinals)
  const round3Matchups = getMatchupsForRound(3); // 1 matchup (Championship)

  // Helper function to get the correct matchup class based on position
  const getMatchupClass = (roundNumber: number, matchupIndex: number): string => {
    if (roundNumber === 1) {
      // First round: 4 matchups total
      return `matchup8-${matchupIndex + 1}`;
    } else if (roundNumber === 2) {
      // Second round (Semifinals): 2 matchups
      return `matchup8-${matchupIndex + 5}`;
    } else if (roundNumber === 3) {
      // Championship
      return 'championship8';
    }
    return 'matchup8';
  };

  return (
    <div className={styles.bracketContainer8}>
      <div className={styles.bracketScaler8}>
        <header className={styles.header8}>
          <ol className={styles.headerList8}>
            <li>Round 1</li>
            <li>Semifinals</li>
            <li>Finals</li>
            <li>Semifinals</li>
            <li>Round 1</li>
          </ol>
        </header>

        <div className="p-4 md:p-5">
          <div className={styles.bracket8}>

            {/* Round 1 matchups */}
            {round1Matchups.map((match, index) => (
              <BracketMatch
                key={match.matchupId}
                matchupClass={getMatchupClass(1, index)}
                matchupId={match.matchupId}
                player1={{ 
                  username: match.player1.username, 
                  score: match.player1.score, 
                  id: match.player1.participantId 
                }}
                player2={{ 
                  username: match.player2.username, 
                  score: match.player2.score, 
                  id: match.player2.participantId 
                }}
              />
            ))}

            {/* Championship - Updated to match 32-bracket style */}
            <div className={styles.championship8Container}>
              {round3Matchups.map(match => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="championship8"
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.username, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.username, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>

            {/* Round 2 matchups (Semifinals) */}
            {round2Matchups.map((match, index) => (
              <BracketMatch
                key={match.matchupId}
                matchupClass={getMatchupClass(2, index)}
                matchupId={match.matchupId}
                player1={{ 
                  username: match.player1.username, 
                  score: match.player1.score, 
                  id: match.player1.participantId 
                }}
                player2={{ 
                  username: match.player2.username, 
                  score: match.player2.score, 
                  id: match.player2.participantId 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket8;
