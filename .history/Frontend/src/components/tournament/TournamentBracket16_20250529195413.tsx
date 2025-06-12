import React, { useMemo } from 'react';
import styles from './TournamentBracket16.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament';

/**
 * TournamentBracket16 Component
 * 
 * A dedicated component for displaying 16-participant tournament brackets.
 * This component provides optimized layout and styling specifically for 16-bracket tournaments,
 * avoiding conflicts with other bracket sizes and ensuring clean visual presentation.
 * 
 * Features:
 * - 9-column grid layout optimized for 16 participants (updated to match header layout)
 * - 4 rounds: Round 1 (8 matches), Top 8 (4 matches), Round 3 (2 matches), Round 4 (1 match)
 * - 4 regions layout for balanced visual distribution
 * - Responsive design with proper scaling across different screen sizes
 * - Support for BYE matchups and visual representation
 * - Integrated with backend bracket generation algorithm
 * 
 * Structure:
 * - Round 1: 8 matchups (16 -> 8 players)
 * - Round 2: 4 matchups (8 -> 4 players) [Top 8]
 * - Round 3: 2 matchups (4 -> 2 players) [Semifinals]
 * - Round 4: 1 matchup (2 -> 1 player) [Championship]
 * 
 * Usage:
 * This component is automatically used when actualBracketSize === 16 is detected
 * in the main TournamentBracket component. No manual invocation needed.
 * 
 * Props:
 * @param participants - Array of tournament participants
 * @param generatedBracket - Array of FrontendBracketMatchup from backend generation
 */

interface TournamentBracket16Props {
  participants: Participant[];
  generatedBracket?: FrontendBracketMatchup[];
}

const TournamentBracket16: React.FC<TournamentBracket16Props> = ({ participants, generatedBracket }) => {
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

  // Get matchups for each round (16-bracket has 4 rounds)
  const round1Matchups = getMatchupsForRound(1); // 8 matchups
  const round2Matchups = getMatchupsForRound(2); // 4 matchups  
  const round3Matchups = getMatchupsForRound(3); // 2 matchups (Semifinals)
  const round4Matchups = getMatchupsForRound(4); // 1 matchup (Championship)

  // Distribute round 1 matchups into regions (4 regions, 2 matchups each)
  const round1Region1 = useMemo(() => round1Matchups.slice(0, 2), [round1Matchups]);
  const round1Region2 = useMemo(() => round1Matchups.slice(2, 4), [round1Matchups]);
  const round1Region3 = useMemo(() => round1Matchups.slice(4, 6), [round1Matchups]);
  const round1Region4 = useMemo(() => round1Matchups.slice(6, 8), [round1Matchups]);

  // Distribute round 2 matchups into regions (4 regions, 1 matchup each)
  const round2Region1 = useMemo(() => round2Matchups.slice(0, 1), [round2Matchups]);
  const round2Region2 = useMemo(() => round2Matchups.slice(1, 2), [round2Matchups]);
  const round2Region3 = useMemo(() => round2Matchups.slice(2, 3), [round2Matchups]);
  const round2Region4 = useMemo(() => round2Matchups.slice(3, 4), [round2Matchups]);

  // Round 3 (Semifinals) - 2 matchups
  const semifinal1 = round3Matchups.slice(0, 1);
  const semifinal2 = round3Matchups.slice(1, 2);

  // Round 4 (Championship)
  const championshipMatchup = round4Matchups;

  // Helper function to get the correct matchup class based on position
  const getMatchupClass = (roundNumber: number, regionIndex: number, matchupIndex: number): string => {
    if (roundNumber === 1) {
      // First round: 8 matchups total
      const absoluteIndex = regionIndex * 2 + matchupIndex + 1;
      return `matchup16-${absoluteIndex}`;
    } else if (roundNumber === 2) {
      // Second round: 4 matchups total
      const absoluteIndex = regionIndex + 9;
      return `matchup16-${absoluteIndex}`;
    }
    // Remove the semifinal logic here since they're handled separately
    return 'matchup16';
  };

  return (
    <div className={styles.bracketContainer16}>
      <div className={styles.bracketScaler16}>
        <header className={styles.header16}>
          <ol className={styles.headerList16}>
            <li>Round 1</li>
            <li>Top 8</li>
            <li>Semifinals</li>
            <li>Finals</li>
            <li>Semifinals</li>
            <li>Top 8</li>
            <li>Round 1</li>
          </ol>
        </header>

        <div className="p-4 md:p-5">
          <div className={styles.bracket16}>
            <figure className={styles.logo16}></figure>

            {/* Region 1 */}
            <div className={`${styles.region16} ${styles['region16-1']}`}>
              {round1Region1.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(1, 0, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
              {round2Region1.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(2, 0, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>

            {/* Region 2 */}
            <div className={`${styles.region16} ${styles['region16-2']}`}>
              {round1Region2.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(1, 1, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
              {round2Region2.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(2, 1, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>

            {/* Region 3 */}
            <div className={`${styles.region16} ${styles['region16-3']}`}>
              {round1Region3.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(1, 2, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
              {round2Region3.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(2, 2, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>

            {/* Region 4 */}
            <div className={`${styles.region16} ${styles['region16-4']}`}>
              {round1Region4.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(1, 3, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
              {round2Region4.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(2, 3, index)}
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>

            {/* Final Four */}
            <div className={styles.finalFour16}>
              {/* Semifinal 1 - Left side */}
              {semifinal1.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="matchup16-13"
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
              
              {/* Semifinal 2 - Right side */}
              {semifinal2.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="matchup16-14"
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}

              {/* Championship - Updated to match 32-bracket style */}
              {championshipMatchup.map(match => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="championship16"
                  matchupId={match.matchupId}
                  player1={{ 
                    username: match.player1.displayName, 
                    score: match.player1.score, 
                    id: match.player1.participantId 
                  }}
                  player2={{ 
                    username: match.player2.displayName, 
                    score: match.player2.score, 
                    id: match.player2.participantId 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket16;