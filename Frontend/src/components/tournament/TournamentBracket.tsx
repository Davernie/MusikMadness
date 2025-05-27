import React, { useEffect, useMemo, useState } from 'react';
import styles from './TournamentBracket.module.css';
import BracketMatch from './BracketMatch';
import { Participant, FrontendBracketMatchup } from '../../types/tournament'; // Corrected import path

// Remove BackendTrack, BackendMatchup, PlayerSlot, GeneratedMatchup interfaces if FrontendBracketMatchup replaces their use

interface TournamentBracketProps {
  // matchups?: BackendMatchup[]; // This was the old prop for individual matchups, replaced by generatedBracket
  participants: Participant[]; // Keep for initial generation if generatedBracket is not present (upcoming tournaments)
  generatedBracket?: FrontendBracketMatchup[]; // New prop for the full bracket structure from backend
}

// Fisher-Yates shuffle algorithm - keep if still used for pre-generation display
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Client-side generation functions (generateInitialRoundSlots, pairSlotsToMatchups, getPlaceholderMatch) 
// might become obsolete or only used if generatedBracket is not available.
// For now, let's assume they might be used as a fallback or for a preview.

const TournamentBracket: React.FC<TournamentBracketProps> = ({ participants, generatedBracket }) => {
  // State for client-side generated matchups (fallback or preview)
  // const [clientRound1Matchups, setClientRound1Matchups] = useState<FrontendBracketMatchup[]>([]); 
  // This local state might be entirely replaced if generatedBracket is always the source of truth after tournament starts

  // Determine the source of truth for bracket data
  const bracketDataToRender = useMemo(() => {
    if (generatedBracket && generatedBracket.length > 0) {
      return generatedBracket;
    }
    // Fallback: If no generatedBracket from backend, and participants are present (e.g., for an upcoming tournament preview)
    // Re-implement client-side generation if needed for preview, or return empty array if bracket only shows post-generation.
    // For now, to simplify, if no generatedBracket, we won't render client-side previews here.
    // This part would need to be reinstated if client-side preview before 'beginTournament' is desired.
    /* 
    if (participants && participants.length > 0) {
      const initialSlots = generateInitialRoundSlots(participants); // Needs to be adapted to FrontendBracketMatchup type
      const pairedMatchups = pairSlotsToMatchups(initialSlots); // Needs to be adapted
      // ... and then generate placeholders for subsequent rounds, all conforming to FrontendBracketMatchup
      return pairedMatchups; // This would only be round 1, needs full generation
    }
    */
    return []; // Default to empty if no server data and no client preview logic here
  }, [generatedBracket, participants]);

  // Helper to get matchups for a specific round from bracketDataToRender
  const getMatchupsForRound = (roundNumber: number): FrontendBracketMatchup[] => {
    return bracketDataToRender.filter(m => m.roundNumber === roundNumber);
  };

  // Prepare regional data based on bracketDataToRender
  const round1Matchups = useMemo(() => getMatchupsForRound(1), [bracketDataToRender]);
  const round1Region1 = useMemo(() => round1Matchups.slice(0, 8), [round1Matchups]);
  const round1Region2 = useMemo(() => round1Matchups.slice(8, 16), [round1Matchups]);
  const round1Region3 = useMemo(() => round1Matchups.slice(16, 24), [round1Matchups]);
  const round1Region4 = useMemo(() => round1Matchups.slice(24, 32), [round1Matchups]);

  const round2Matchups = useMemo(() => getMatchupsForRound(2), [bracketDataToRender]);
  const round2Region1 = useMemo(() => round2Matchups.slice(0, 4), [round2Matchups]);
  const round2Region2 = useMemo(() => round2Matchups.slice(4, 8), [round2Matchups]);
  const round2Region3 = useMemo(() => round2Matchups.slice(8, 12), [round2Matchups]);
  const round2Region4 = useMemo(() => round2Matchups.slice(12, 16), [round2Matchups]);

  const round3Matchups = useMemo(() => getMatchupsForRound(3), [bracketDataToRender]);
  const round3Region1 = useMemo(() => round3Matchups.slice(0, 2), [round3Matchups]);
  const round3Region2 = useMemo(() => round3Matchups.slice(2, 4), [round3Matchups]);
  const round3Region3 = useMemo(() => round3Matchups.slice(4, 6), [round3Matchups]);
  const round3Region4 = useMemo(() => round3Matchups.slice(6, 8), [round3Matchups]);

  const elite8Matchups = useMemo(() => getMatchupsForRound(4), [bracketDataToRender]);
  // Assuming elite8 matchups are ordered correctly for regions in generatedBracket
  const elite8Region1 = useMemo(() => elite8Matchups.slice(0, 1), [elite8Matchups]); // R4M1
  const elite8Region2 = useMemo(() => elite8Matchups.slice(1, 2), [elite8Matchups]); // R4M2
  const elite8Region3 = useMemo(() => elite8Matchups.slice(2, 3), [elite8Matchups]); // R4M3
  const elite8Region4 = useMemo(() => elite8Matchups.slice(3, 4), [elite8Matchups]); // R4M4

  const finalFourMatchups = useMemo(() => getMatchupsForRound(5), [bracketDataToRender]);
  const championshipMatchup = useMemo(() => getMatchupsForRound(6), [bracketDataToRender]); // Should be a single item array

  if (!bracketDataToRender || bracketDataToRender.length === 0) {
    // If participants are present, it implies the tournament is upcoming and bracket isn't generated yet.
    if (participants && participants.length > 0) {
        return (
            <div className="w-full text-center py-10 text-gray-400">
                Bracket will be generated when the tournament begins.
            </div>
        );
    }
    // If no participants and no bracket data, it might be an error or an uninitialized state.
    return <div className="w-full text-center py-10 text-gray-400">Bracket data is not available.</div>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start overflow-auto pt-4">
      <div className="flex items-start justify-center w-full">
        <div className={styles.bracketScaler}>
          <div className="w-[2000px]">
            <header>
              <ol>
                <li>Round 1A</li>
                <li>Round 2A</li>
                <li>Round 3A</li>
                <li>QTR Final</li>
                <li>Finals</li>
                <li>QTR Final</li>
                <li>Round 3B</li>
                <li>Round 2B</li>
                <li>Round 1B</li>
              </ol>
            </header>

            <div className="p-4 md:p-5">
              <div className={styles.bracket}>
                <figure className={styles.logo}>
                  <img src="/src/assets/images/SmallMM_Transparent.png" alt="Tournament Logo" />
                </figure>

                {/* Region 1 */}
                <div className={`${styles.region} ${styles['region-1']}`}>
                  {round1Region1.map((match, index) => (
                    <BracketMatch
                      key={match.matchupId} // Use matchupId from backend data
                      matchupClass={`matchup-${index + 1}`} // CSS class might still be index-based for positioning
                      matchupId={match.matchupId}
                      player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }}
                      player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }}
                    />
                  ))}
                  {round2Region1.map((match, index) => (
                    <BracketMatch
                      key={match.matchupId}
                      matchupClass={`matchup-${32 + index + 1}`}
                      matchupId={match.matchupId}
                      player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }}
                      player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }}
                    />
                  ))}
                  {round3Region1.map((match, index) => (
                    <BracketMatch
                      key={match.matchupId}
                      matchupClass={`matchup-${32+16+index + 1}`}
                      matchupId={match.matchupId}
                      player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }}
                      player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }}
                    />
                  ))}
                  {elite8Region1.map((match, index) => ( // elite8Region1 is an array of one item
                    <BracketMatch
                      key={match.matchupId}
                      matchupClass="matchup-57" // Elite 8 Match 1
                      matchupId={match.matchupId}
                      player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }}
                      player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }}
                    />
                  ))}
                </div>

                {/* Region 2 - similar mapping for round1Region2, round2Region2, round3Region2, elite8Region2 */}
                <div className={`${styles.region} ${styles['region-2']}`}>
                  {round1Region2.map((match, index) => (
                    <BracketMatch key={match.matchupId} matchupClass={`matchup-${index + 1 + 8}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                  {round2Region2.map((match, index) => (
                    <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + index + 1 + 4}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                  {round3Region2.map((match, index) => (
                    <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16+index + 1 + 2}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                  {elite8Region2.map((match, index) => (
                    <BracketMatch key={match.matchupId} matchupClass="matchup-58" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                </div>

                {/* Region 3 - similar mapping */}
                <div className={`${styles.region} ${styles['region-3']}`}>
                    {round1Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${index + 1 + 16}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {round2Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + index + 1 + 8}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {round3Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16+index + 1 + 4}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {elite8Region3.map((match, index) => <BracketMatch key={match.matchupId} matchupClass="matchup-59" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                </div>

                {/* Region 4 - similar mapping */}
                <div className={`${styles.region} ${styles['region-4']}`}>
                    {round1Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${index + 1 + 24}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {round2Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32 + index + 1 + 12}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {round3Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass={`matchup-${32+16+index + 1 + 6}`} matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                    {elite8Region4.map((match, index) => <BracketMatch key={match.matchupId} matchupClass="matchup-60" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} /> )}
                </div>

                {/* Final Four */}
                <div className={styles['final-four']}>
                  {finalFourMatchups.slice(0,1).map(match => (
                     <BracketMatch key={match.matchupId} matchupClass="matchup-61" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                  {finalFourMatchups.slice(1,2).map(match => (
                     <BracketMatch key={match.matchupId} matchupClass="matchup-62" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                  {championshipMatchup.map(match => (
                    <BracketMatch key={match.matchupId} matchupClass="championship" matchupId={match.matchupId} player1={{ name: match.player1.displayName, score: match.player1.score, id: match.player1.participantId }} player2={{ name: match.player2.displayName, score: match.player2.score, id: match.player2.participantId }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
