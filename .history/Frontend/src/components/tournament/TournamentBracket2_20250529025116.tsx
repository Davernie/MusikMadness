import React, { useMemo } from 'react';
import styles from './TournamentBracket2.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament';

/**
 * TournamentBracket2 Component
 * 
 * A dedicated component for displaying 2-participant tournament brackets.
 * This component provides optimized layout and styling specifically for 2-bracket tournaments,
 * styled to match the 4-bracket design but with outer rounds removed.
 * 
 * Features:
 * - Single column grid layout optimized for 2 participants
 * - 1 round: Round 1 (1 match) [Championship]
 * - Identical styling to 4-bracket but simplified
 * - Responsive design with proper scaling across different screen sizes
 * - Support for BYE matchups and visual representation
 * - Integrated with backend bracket generation algorithm
 * 
 * Structure:
 * - Round 1: 1 matchup (2 -> 1 player) [Championship]
 * 
 * Usage:
 * This component is automatically used when actualBracketSize === 2 is detected
 * in the main TournamentBracket component. No manual invocation needed.
 * 
 * Props:
 * @param participants - Array of tournament participants
 * @param generatedBracket - Array of FrontendBracketMatchup from backend generation
 */

interface TournamentBracket2Props {
  participants: Participant[];
  generatedBracket?: FrontendBracketMatchup[];
}

const TournamentBracket2: React.FC<TournamentBracket2Props> = ({ participants, generatedBracket }) => {
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

  // Get the single championship matchup (2-bracket has 1 round)
  const championshipMatchups = getMatchupsForRound(1); // 1 matchup (Championship)

  return (
    <div className={styles.bracketContainer2}>
      <div className={styles.bracketScaler2}>
        <header className={styles.header2}>
          <ol className={styles.headerList2}>
            <li>Finals</li>
          </ol>
        </header>

        <div className="p-4 md:p-5">
          <div className={styles.bracket2}>

            {/* Championship matchup - the only matchup for 2 participants */}
            {championshipMatchups.map(match => (
              <BracketMatch
                key={match.matchupId}
                matchupClass="championship2"
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

export default TournamentBracket2;