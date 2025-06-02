import React, { useMemo } from 'react';
import styles from './TournamentBracket4.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament';

/**
 * TournamentBracket4 Component
 * 
 * A dedicated component for displaying 4-participant tournament brackets.
 * This component provides optimized layout and styling specifically for 4-bracket tournaments,
 * styled to match the 8-bracket design but with outer rounds removed.
 * 
 * Features:
 * - 3-column grid layout optimized for 4 participants
 * - 2 rounds: Round 1 (2 matches), Round 2 (1 match)
 * - Identical styling to 8-bracket but simplified
 * - Responsive design with proper scaling across different screen sizes
 * - Support for BYE matchups and visual representation
 * - Integrated with backend bracket generation algorithm
 * 
 * Structure:
 * - Round 1: 2 matchups (4 -> 2 players) [Semifinals]
 * - Round 2: 1 matchup (2 -> 1 player) [Championship]
 * 
 * Usage:
 * This component is automatically used when actualBracketSize === 4 is detected
 * in the main TournamentBracket component. No manual invocation needed.
 * 
 * Props:
 * @param participants - Array of tournament participants
 * @param generatedBracket - Array of FrontendBracketMatchup from backend generation
 */

interface TournamentBracket4Props {
  participants: Participant[];
  generatedBracket?: FrontendBracketMatchup[];
}

const TournamentBracket4: React.FC<TournamentBracket4Props> = ({ participants, generatedBracket }) => {
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

  // Get matchups for each round (4-bracket has 2 rounds)
  const round1Matchups = getMatchupsForRound(1); // 2 matchups (Semifinals)
  const round2Matchups = getMatchupsForRound(2); // 1 matchup (Championship)

  // Championship matchup - positioned above semifinals
  const championshipMatchup = round2Matchups.length > 0 ? [round2Matchups[0]] : [];

  return (
    <div className={styles.bracketContainer4}>
      <div className={styles.bracketScaler4}>
        <header className={styles.header4}>
          <ol className={styles.headerList4}>
            <li>Semifinals</li>
            <li>Finals</li>
            <li>Semifinals</li>
          </ol>
        </header>

        <div className="p-4 md:p-5">
          <div className={styles.bracket4}>

            {/* Semifinal 1 - Left side */}
            {round1Matchups.slice(0, 1).map((match, index) => (
              <BracketMatch
                key={match.matchupId}
                matchupClass="matchup4-1"
                matchupId={match.matchupId}
                player1={{ 
                  name: match.player1.displayName, 
                  score: match.player1.score, 
                  id: match.player1.participantId 
                }}
                player2={{ 
                  name: match.player2.displayName, 
                  score: match.player2.score, 
                  id: match.player2.participantId 
                }}
              />
            ))}
            
            {/* Semifinal 2 - Right side */}
            {round1Matchups.slice(1, 2).map((match, index) => (
              <BracketMatch
                key={match.matchupId}
                matchupClass="matchup4-2"
                matchupId={match.matchupId}
                player1={{ 
                  name: match.player1.displayName, 
                  score: match.player1.score, 
                  id: match.player1.participantId 
                }}
                player2={{ 
                  name: match.player2.displayName, 
                  score: match.player2.score, 
                  id: match.player2.participantId 
                }}
              />            ))}

            {/* Championship - Direct placement without container */}
            {championshipMatchup.map(match => (
              <BracketMatch
                key={match.matchupId}
                matchupClass="championship4"
                matchupId={match.matchupId}
                player1={{ 
                  name: match.player1.displayName, 
                  score: match.player1.score, 
                  id: match.player1.participantId 
                }}
                player2={{ 
                  name: match.player2.displayName, 
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

export default TournamentBracket4;