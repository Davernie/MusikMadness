import React, { useMemo } from 'react';
import styles from './TournamentBracket.module.css';
import BracketMatch from './BracketMatch';
import TournamentBracket32 from './TournamentBracket32'; // Import the dedicated 32-bracket component
import TournamentBracket16 from './TournamentBracket16'; // Import the dedicated 16-bracket component
import TournamentBracket8 from './TournamentBracket8'; // Import the dedicated 8-bracket component
import TournamentBracket4 from './TournamentBracket4'; // Import the dedicated 4-bracket component
import TournamentBracket2 from './TournamentBracket2'; // Import the dedicated 2-bracket component
import { Participant, FrontendBracketMatchup } from '../../types/tournament'; // Corrected import path

// Remove BackendTrack, BackendMatchup, PlayerSlot, GeneratedMatchup interfaces if FrontendBracketMatchup replaces their use

interface TournamentBracketProps {
  // matchups?: BackendMatchup[]; // This was the old prop for individual matchups, replaced by generatedBracket
  participants: Participant[]; // Keep for initial generation if generatedBracket is not present (upcoming tournaments)
  generatedBracket?: FrontendBracketMatchup[]; // New prop for the full bracket structure from backend
  tournamentSize?: 16 | 32 | 64; // This now primarily hints at the CSS layout scale, made optional
  bracketSize?: number; // Actual bracket size from backend (2, 4, 8, 16, 32, 64)
}

// Client-side generation functions (generateInitialRoundSlots, pairSlotsToMatchups, getPlaceholderMatch) 
// might become obsolete or only used if generatedBracket is not available.
// For now, let's assume they might be used as a fallback or for a preview.

const TournamentBracket: React.FC<TournamentBracketProps> = ({ participants, generatedBracket, bracketSize }) => {
  // State for client-side generated matchups (fallback or preview)
  // const [clientRound1Matchups, setClientRound1Matchups] = useState<FrontendBracketMatchup[]>([]); 
  // This local state might be entirely replaced if generatedBracket is always the source of truth after tournament starts

  const bracketDataToRender = useMemo(() => {
    return (generatedBracket && generatedBracket.length > 0) ? generatedBracket : [];
  }, [generatedBracket]);

  // Detect actual bracket size from the data or use provided bracketSize
  const actualBracketSize = useMemo(() => {
    if (bracketSize) return bracketSize;
      // If no bracketSize provided, detect from data
    if (bracketDataToRender.length === 0) return participants?.length || 0;
    
    // Calculate from the number of round 1 matchups
    const round1Matchups = bracketDataToRender.filter(m => m.roundNumber === 1);
    return round1Matchups.length * 2;
  }, [bracketSize, bracketDataToRender, participants?.length]);

  // Check if this is a 32-bracket tournament and use dedicated component
  if (actualBracketSize === 32) {
    return <TournamentBracket32 participants={participants} generatedBracket={generatedBracket} />;
  }

  // Check if this is a 16-bracket tournament and use dedicated component
  if (actualBracketSize === 16) {
    return <TournamentBracket16 participants={participants} generatedBracket={generatedBracket} />;
  }

  // Check if this is a 8-bracket tournament and use dedicated component
  if (actualBracketSize === 8) {
    return <TournamentBracket8 participants={participants} generatedBracket={generatedBracket} />;
  }

  // Check if this is a 4-bracket tournament and use dedicated component
  if (actualBracketSize === 4) {
    return <TournamentBracket4 participants={participants} generatedBracket={generatedBracket} />;
  }

  // Check if this is a 2-bracket tournament and use dedicated component
  if (actualBracketSize === 2) {
    return <TournamentBracket2 participants={participants} generatedBracket={generatedBracket} />;
  }

  // Calculate which rounds to show based on bracket size
  // For 64: show rounds 1-6 (R1=Round1, R2=Round2, R3=Round3, R4=Elite8, R5=Semifinals, R6=Finals)
  // For 32: show rounds 1-5 (R1=Round2, R2=Round3, R3=Elite8, R4=Semifinals, R5=Finals)
  // For 16: show rounds 1-4 (R1=Round3, R2=Elite8, R3=Semifinals, R4=Finals)
  // For 8:  show rounds 1-3 (R1=Elite8, R2=Semifinals, R3=Finals)
  // For 4:  show rounds 1-2 (R1=Semifinals, R2=Finals)
  // For 2:  show round 1 only (R1=Finals)
  
  const getRoundMapping = (size: number) => {
    const totalRounds = Math.log2(size);
    const roundsToSkip = 6 - totalRounds; // 6 is max rounds for 64-bracket
    
    return {
      totalRounds,
      roundsToSkip,
      // Map actual round numbers to display positions
      getDisplayRound: (actualRound: number) => actualRound + roundsToSkip
    };
  };

  const roundMapping = getRoundMapping(actualBracketSize);

  // Helper to get all matchups for a specific round number from the raw bracket data
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

  // Special case for 2 participants: only show the final populated matchup
  if (actualBracketSize === 2) {
    const populatedMatches = bracketDataToRender.filter(match =>
      match.player1 && match.player1.participantId &&
      match.player2 && match.player2.participantId
    );

    if (populatedMatches.length === 1) {
      const finalMatchupToShow = populatedMatches[0];
      return (
        <div className={styles.bracketContainer}>
          <div className={styles.centeringWrapper}>
            <div className={styles.simpleBracketView}>
              <header className={styles.simpleHeader}>
                <ol>
                  <li>Finals</li>
                </ol>
              </header>
              <div className={styles.simpleMatchArea}>
                <figure className={styles.logo}>
                  <img src="/src/assets/images/SmallMM_Transparent.png" alt="Tournament Logo" />
                </figure>
                <div className={styles.championshipContainer}>
                  <BracketMatch
                    key={finalMatchupToShow.matchupId}
                    matchupClass="championship"
                    matchupId={finalMatchupToShow.matchupId}                    player1={{ username: finalMatchupToShow.player1.username, score: finalMatchupToShow.player1.score, id: finalMatchupToShow.player1.participantId }}
                    player2={{ username: finalMatchupToShow.player2.username, score: finalMatchupToShow.player2.score, id: finalMatchupToShow.player2.participantId }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <div className="w-full text-center py-10 text-gray-400">Bracket data is being prepared...</div>;
  }

  // For all other sizes, use the standard layout but only show relevant rounds
  // Get matchups for each actual round
  const allRounds: FrontendBracketMatchup[][] = [];
  for (let round = 1; round <= roundMapping.totalRounds; round++) {
    allRounds.push(getMatchupsForRound(round));
  }

  // Map to the 64-bracket structure (6 rounds max)
  const round1Matchups = roundMapping.totalRounds >= 6 ? allRounds[0] : [];
  const round2Matchups = roundMapping.totalRounds >= 5 ? allRounds[roundMapping.totalRounds >= 6 ? 1 : 0] : [];
  const round3Matchups = roundMapping.totalRounds >= 4 ? allRounds[roundMapping.totalRounds >= 6 ? 2 : roundMapping.totalRounds >= 5 ? 1 : 0] : [];
  const round4Matchups = roundMapping.totalRounds >= 3 ? allRounds[roundMapping.totalRounds >= 6 ? 3 : roundMapping.totalRounds >= 5 ? 2 : roundMapping.totalRounds >= 4 ? 1 : 0] : []; // Elite 8
  const round5Matchups = roundMapping.totalRounds >= 2 ? allRounds[roundMapping.totalRounds >= 6 ? 4 : roundMapping.totalRounds >= 5 ? 3 : roundMapping.totalRounds >= 4 ? 2 : roundMapping.totalRounds >= 3 ? 1 : 0] : []; // Semifinals
  const round6Matchups = allRounds[roundMapping.totalRounds - 1]; // Finals (always the last round)

  // Distribute round matchups into regions. 
  // This assumes the backend orders matchups within a round consistently (e.g., R1M1-R1M8 for Region1, R1M9-R1M16 for Region2, etc. for a 64p structure)
  // The actual number of matchups per region per round will depend on what `generatedBracket` contains.

  const round1Region1 = useMemo(() => round1Matchups.slice(0, 8), [round1Matchups]);
  const round1Region2 = useMemo(() => round1Matchups.slice(8, 16), [round1Matchups]);
  const round1Region3 = useMemo(() => round1Matchups.slice(16, 24), [round1Matchups]);
  const round1Region4 = useMemo(() => round1Matchups.slice(24, 32), [round1Matchups]);

  const round2Region1 = useMemo(() => round2Matchups.slice(0, 4), [round2Matchups]);
  const round2Region2 = useMemo(() => round2Matchups.slice(4, 8), [round2Matchups]);
  const round2Region3 = useMemo(() => round2Matchups.slice(8, 12), [round2Matchups]);
  const round2Region4 = useMemo(() => round2Matchups.slice(12, 16), [round2Matchups]);

  const round3Region1 = useMemo(() => round3Matchups.slice(0, 2), [round3Matchups]);
  const round3Region2 = useMemo(() => round3Matchups.slice(2, 4), [round3Matchups]);
  const round3Region3 = useMemo(() => round3Matchups.slice(4, 6), [round3Matchups]);
  const round3Region4 = useMemo(() => round3Matchups.slice(6, 8), [round3Matchups]);

  // Elite 8 (Round 4 in a 64p structure)
  const elite8Region1 = useMemo(() => round4Matchups.slice(0, 1), [round4Matchups]);
  const elite8Region2 = useMemo(() => round4Matchups.slice(1, 2), [round4Matchups]);
  const elite8Region3 = useMemo(() => round4Matchups.slice(2, 3), [round4Matchups]);
  const elite8Region4 = useMemo(() => round4Matchups.slice(3, 4), [round4Matchups]);

  // Final Four (Round 5 in a 64p structure)
  const finalFourMatchups = round5Matchups; // Expects 2 matchups

  // Championship (Round 6 in a 64p structure)
  const championshipMatchup = round6Matchups; // Expects 1 matchup

  // For 2 participants, use the simple layout
  if (actualBracketSize === 2) {
    // Already handled above
  }

  // For all other sizes (4, 8, 16, 32, 64), use the standard bracket layout
  return (
    <div className={styles.bracketContainer}>
      <div className={styles.centeringWrapper}>
        <div className={styles.bracketScaler} data-tournament-size={actualBracketSize}>
          <header>
            <ol>
              {/* Round 1 - only show for 64 participants */}
              {actualBracketSize >= 64 ? <li>Round 1</li> : <li style={{ visibility: 'hidden' }}>Round 1</li>}
              
              {/* Round 2 - only show for 32+ participants */}
              {actualBracketSize >= 32 ? <li>Round 2</li> : <li style={{ visibility: 'hidden' }}>Round 2</li>}
              
              {/* Round 3 - only show for 16+ participants */}
              {actualBracketSize >= 16 ? <li>Round 3</li> : <li style={{ visibility: 'hidden' }}>Round 3</li>}
              
              {/* Top 8 - show for 8+ participants, but rename for smaller brackets */}
              {actualBracketSize >= 8 ? (
                <li>{actualBracketSize === 8 ? 'Round 1' : actualBracketSize === 4 ? 'Semifinals' : 'Top 8'}</li>
              ) : (
                <li style={{ visibility: 'hidden' }}>Top 8</li>
              )}
              
              {/* Finals - always show but may rename */}
              <li>{actualBracketSize === 4 ? 'Finals' : 'Finals'}</li>
              
              {/* Top 8 (right side) - show for 8+ participants, but rename for smaller brackets */}
              {actualBracketSize >= 8 ? (
                <li>{actualBracketSize === 8 ? 'Round 1' : actualBracketSize === 4 ? 'Semifinals' : 'Top 8'}</li>
              ) : (
                <li style={{ visibility: 'hidden' }}>Top 8</li>
              )}
              
              {/* Round 3 (right side) - only show for 16+ participants */}
              {actualBracketSize >= 16 ? <li>Round 3</li> : <li style={{ visibility: 'hidden' }}>Round 3</li>}
              
              {/* Round 2 (right side) - only show for 32+ participants */}
              {actualBracketSize >= 32 ? <li>Round 2</li> : <li style={{ visibility: 'hidden' }}>Round 2</li>}
              
              {/* Round 1 (right side) - only show for 64 participants */}
              {actualBracketSize >= 64 ? <li>Round 1</li> : <li style={{ visibility: 'hidden' }}>Round 1</li>}
            </ol>
          </header>

          <div className="p-4 md:p-5">
            <div className={styles.bracket}>
              <figure className={styles.logo}>
              </figure>

              {/* Region 1 */}
              <div className={`${styles.region} ${styles['region-1']}`}>
                {round1Region1.map((match, index) => (
                  <BracketMatch
                    key={match.matchupId} 
                    matchupClass={`matchup-${index + 1}`} // Original 64p grid class (matchups 1-8 for R1R1)
                    matchupId={match.matchupId}
                    player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                    player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                  />
                ))}
                {round2Region1.map((match, index) => (
                  <BracketMatch
                    key={match.matchupId}
                    matchupClass={`matchup-${32 + index + 1}`} // Original 64p grid class (matchups 33-36 for R2R1)
                    matchupId={match.matchupId}
                    player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                    player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                  />
                ))}
                {round3Region1.map((match, index) => (
                  <BracketMatch
                    key={match.matchupId}
                    matchupClass={`matchup-${32+16 + index + 1}`} // Original 64p grid class (matchups 49-50 for R3R1)
                    matchupId={match.matchupId}
                    player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                    player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                  />
                ))}                {elite8Region1.map((match) => (
                  <BracketMatch
                    key={match.matchupId}
                    matchupClass="matchup-57" // Original 64p grid class (R4M1)
                    matchupId={match.matchupId}
                    player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                    player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                  />
                ))}
              </div>

              {/* Region 2 - similar mapping for round1Region2, round2Region2, round3Region2, elite8Region2 */}
              <div className={`${styles.region} ${styles['region-2']}`}>
                {round1Region2.map((match, index) => (
                                     <BracketMatch key={match.matchupId} matchupClass={`matchup-${8 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} />
                ))}
                {round2Region2.map((match, index) => (
                  <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + 4 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} />
                ))}
                {round3Region2.map((match, index) => (
                  <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16 + 2 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} />
                ))}                {elite8Region2.map((match) => (
                  <BracketMatch key={match.matchupId} matchupClass="matchup-58" matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} />
                ))}
              </div>

              {/* Region 3 - similar mapping */}
              <div className={`${styles.region} ${styles['region-3']}`}>
                  {round1Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${16 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {round2Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + 8 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {round3Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16 + 4 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {elite8Region3.map((match) => <BracketMatch key={match.matchupId} matchupClass="matchup-59" matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
              </div>

              {/* Region 4 - similar mapping */}
              <div className={`${styles.region} ${styles['region-4']}`}>
                  {round1Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${24 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {round2Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + 12 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {round3Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16 + 6 + index + 1}`} matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
                  {elite8Region4.map((match) => <BracketMatch key={match.matchupId} matchupClass="matchup-60" matchupId={match.matchupId} player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }} player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }} /> )}
              </div>

              {/* Final Four - Championship only */}
              <div className={styles['final-four']}>
                {championshipMatchup.map(match => (
                  <BracketMatch 
                    key={match.matchupId} 
                    matchupClass="championship"
                    matchupId={match.matchupId} 
                    player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                    player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                  />
                ))}
              </div>

              {/* Semifinals - Separate container */}
              <div className={styles['semifinals']}>
                {finalFourMatchups.map((match, index) => {
                  const className = index === 0 ? "matchup-61" : "matchup-62";
                  return (
                    <BracketMatch 
                      key={match.matchupId} 
                      matchupClass={className}
                      matchupId={match.matchupId} 
                      player1={{ username: match.player1.username, score: match.player1.score, id: match.player1.participantId }}
                      player2={{ username: match.player2.username, score: match.player2.score, id: match.player2.participantId }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
