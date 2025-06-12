import React, { useMemo } from 'react';
import styles from './TournamentBracket32.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament';

/**
 * TournamentBracket32 Component
 * 
 * A dedicated component for displaying 32-participant tournament brackets.
 * This component provides optimized layout and styling specifically for 32-bracket tournaments,
 * avoiding conflicts with other bracket sizes and ensuring clean visual presentation.
 * 
 * Features:
 * - 9-column grid layout optimized for 32 participants
 * - 5 rounds: Round 1 (16 matches), Round 2 (8 matches), Top 8 (4 matches), Elite 8 (2 matches), Championship (1 match)
 * - 4 regions layout for balanced visual distribution
 * - Responsive design with proper scaling across different screen sizes
 * - Support for BYE matchups and visual representation
 * - Integrated with backend bracket generation algorithm
 * 
 * Structure:
 * - Round 1: 16 matchups (32 -> 16 players)
 * - Round 2: 8 matchups (16 -> 8 players)
 * - Round 3: 4 matchups (8 -> 4 players) [Top 8]
 * - Round 4: 2 matchups (4 -> 2 players) [Elite 8/Semifinals]
 * - Round 5: 1 matchup (2 -> 1 player) [Championship]
 * 
 * Usage:
 * This component is automatically used when actualBracketSize === 32 is detected
 * in the main TournamentBracket component. No manual invocation needed.
 * 
 * Props:
 * @param participants - Array of tournament participants
 * @param generatedBracket - Array of FrontendBracketMatchup from backend generation
 */

interface TournamentBracket32Props {
  participants: Participant[];
  generatedBracket?: FrontendBracketMatchup[];
}

const TournamentBracket32: React.FC<TournamentBracket32Props> = ({ participants, generatedBracket }) => {
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

  // Get matchups for each round (32-bracket has 5 rounds)
  const round1Matchups = getMatchupsForRound(1); // 16 matchups
  const round2Matchups = getMatchupsForRound(2); // 8 matchups  
  const round3Matchups = getMatchupsForRound(3); // 4 matchups (Top 8)
  const round4Matchups = getMatchupsForRound(4); // 2 matchups (Elite 8)
  const round5Matchups = getMatchupsForRound(5); // 1 matchup (Championship)

  // Distribute round 1 matchups into regions (4 regions, 4 matchups each)
  const round1Region1 = useMemo(() => round1Matchups.slice(0, 4), [round1Matchups]);
  const round1Region2 = useMemo(() => round1Matchups.slice(4, 8), [round1Matchups]);
  const round1Region3 = useMemo(() => round1Matchups.slice(8, 12), [round1Matchups]);
  const round1Region4 = useMemo(() => round1Matchups.slice(12, 16), [round1Matchups]);

  // Distribute round 2 matchups into regions (4 regions, 2 matchups each)
  const round2Region1 = useMemo(() => round2Matchups.slice(0, 2), [round2Matchups]);
  const round2Region2 = useMemo(() => round2Matchups.slice(2, 4), [round2Matchups]);
  const round2Region3 = useMemo(() => round2Matchups.slice(4, 6), [round2Matchups]);
  const round2Region4 = useMemo(() => round2Matchups.slice(6, 8), [round2Matchups]);

  // Distribute round 3 matchups into regions (4 regions, 1 matchup each)
  const round3Region1 = useMemo(() => round3Matchups.slice(0, 1), [round3Matchups]);
  const round3Region2 = useMemo(() => round3Matchups.slice(1, 2), [round3Matchups]);
  const round3Region3 = useMemo(() => round3Matchups.slice(2, 3), [round3Matchups]);
  const round3Region4 = useMemo(() => round3Matchups.slice(3, 4), [round3Matchups]);

  // Round 4 (Elite 8) - 2 semifinals
  const semifinal1 = round4Matchups.slice(0, 1);
  const semifinal2 = round4Matchups.slice(1, 2);

  // Round 5 (Championship)
  const championshipMatchup = round5Matchups;

  // Helper function to get the correct matchup class based on position
  const getMatchupClass = (roundNumber: number, regionIndex: number, matchupIndex: number): string => {
    if (roundNumber === 1) {
      // First round: 16 matchups total
      const absoluteIndex = regionIndex * 4 + matchupIndex + 1;
      return `matchup32-${absoluteIndex}`;
    } else if (roundNumber === 2) {
      // Second round: 8 matchups total
      const absoluteIndex = regionIndex * 2 + matchupIndex + 17;
      return `matchup32-${absoluteIndex}`;
    } else if (roundNumber === 3) {
      // Third round (Top 8): 4 matchups total
      const absoluteIndex = regionIndex + 25;
      return `matchup32-${absoluteIndex}`;
    } else if (roundNumber === 4) {
      // Fourth round (Elite 8): 2 matchups
      return matchupIndex === 0 ? 'matchup32-29' : 'matchup32-30';
    } else if (roundNumber === 5) {
      // Championship
      return 'championship32';
    }
    return 'matchup32';
  };

  return (
    <div className={styles.bracketContainer32}>
      <div className={styles.bracketScaler32}>
        <header className={styles.header32}>
          <ol className={styles.headerList32}>
            <li>Round 1</li>
            <li>Round 2</li>
            <li>Top 8</li>
            <li>Finals</li>
            <li>Top 8</li>
            <li>Round 2</li>
            <li>Round 1</li>          </ol>
        </header>

        <div className={styles.bracket32}>
            <figure className={styles.logo32}></figure>

            {/* Region 1 */}
            <div className={`${styles.region32} ${styles['region32-1']}`}>
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
              {round3Region1.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(3, 0, index)}
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
            <div className={`${styles.region32} ${styles['region32-2']}`}>
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
              {round3Region2.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(3, 1, index)}
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
            <div className={`${styles.region32} ${styles['region32-3']}`}>
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
              {round3Region3.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(3, 2, index)}
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
            <div className={`${styles.region32} ${styles['region32-4']}`}>
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
              {round3Region4.map((match, index) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass={getMatchupClass(3, 3, index)}
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
            </div>            {/* Final Four */}
            <div className={styles.finalFour32}>
              {/* Semifinal 1 */}
              {semifinal1.map((match) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="matchup32-31"
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
              {/* Semifinal 2 */}
              {semifinal2.map((match) => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="matchup32-32"
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

              {/* Championship */}
              {championshipMatchup.map(match => (
                <BracketMatch
                  key={match.matchupId}
                  matchupClass="championship32"
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
                />              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default TournamentBracket32;