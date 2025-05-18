import React, { useState } from 'react';
import styles from './TournamentBracket.module.css';

// Static interface for bracket matches
interface MatchupProps {
  player1: { name: string; score: number };
  player2: { name: string; score: number };
  matchupClass: string;
}

// Define bracket size options
type BracketSize = 16 | 32 | 64;

const BracketMatch: React.FC<MatchupProps> = ({ player1, player2, matchupClass }) => (
  <ul className={`${styles.matchup} ${styles[matchupClass]}`}>
    <li className={`${styles.team} ${styles.teamTop} ${player1.score > player2.score ? styles.winner : ''}`}>
      {player1.name} <span className={styles.score}>{player1.score}</span>
    </li>
    <li className={`${styles.team} ${player2.score > player1.score ? styles.winner : ''}`}>
      {player2.name} <span className={styles.score}>{player2.score}</span>
    </li>
  </ul>
);

const TournamentBracket: React.FC = () => {
  // State to control the bracket size (64, 32, or 16 players)
  const [bracketSize, setBracketSize] = useState<BracketSize>(64);
  
  // Handler for bracket size change
  const handleBracketSizeChange = (size: BracketSize) => {
    setBracketSize(size);
  };
  // Determine container width based on bracket size
  const containerWidth = bracketSize === 16 ? '1800px' : bracketSize === 32 ? '2200px' : '2600px';
  
  // Function to render the appropriate headers based on bracket size
  const renderHeaders = () => {
    switch (bracketSize) {
      case 16:
        return (
          <ol>
            <li>Sweet 16 A</li>
            <li>Elite 8 A</li>
            <li>Finals</li>
            <li>Elite 8 B</li>
            <li>Sweet 16 B</li>
          </ol>
        );
      case 32:
        return (
          <ol>
            <li>Round 2A</li>
            <li>Sweet 16 A</li>
            <li>Elite 8 A</li>
            <li>Finals</li>
            <li>Elite 8 B</li>
            <li>Sweet 16 B</li>
            <li>Round 2B</li>
          </ol>
        );
      case 64:
      default:
        return (
          <ol>
            <li>Round 1A</li>
            <li>Round 2A</li>
            <li>Sweet 16 A</li>
            <li>Elite 8 A</li>
            <li>Finals</li>
            <li>Elite 8 B</li>
            <li>Sweet 16 B</li>
            <li>Round 2B</li>
            <li>Round 1B</li>
          </ol>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`relative z-10 py-4`} style={{ width: containerWidth }}>
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10">
          <div className={styles.bracketControls}>
            <button
              onClick={() => handleBracketSizeChange(16)}
              className={`${styles.bracketSizeButton} ${bracketSize === 16 ? styles.active : ''}`}
            >
              Sweet 16
            </button>
            <button
              onClick={() => handleBracketSizeChange(32)}
              className={`${styles.bracketSizeButton} ${bracketSize === 32 ? styles.active : ''}`}
            >
              32 Players
            </button>
            <button
              onClick={() => handleBracketSizeChange(64)}
              className={`${styles.bracketSizeButton} ${bracketSize === 64 ? styles.active : ''}`}
            >
              64 Players
            </button>
          </div>
          
          <header>
            {renderHeaders()}
          </header>

          <div className="p-3 md:p-4">
            <div className={`${styles.bracket} ${styles[`bracket-size-${bracketSize}`]}`}>
              <figure className={styles.logo}>
                <img src="/src/assets/images/SmallMM_Transparent.png" alt="Tournament Logo" />
              </figure>

              {/* Region 1 */}
              <div className={`${styles.region} ${styles['region-1']}`}>
                {/* Round 1 - Only visible in 64-player bracket */}
                {bracketSize === 64 && [1, 2, 3, 4, 5, 6, 7, 8].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 - Visible in 32 and 64-player brackets */}
                {(bracketSize >= 32) && [33, 34, 35, 36].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-32}` : `Song ${(matchNum-32) * 2 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-31}` : `Song ${(matchNum-32) * 2}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Sweet 16 - Always visible */}
                {[49, 50].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-48}` : `Song ${(matchNum-48) * 4 - 3}`,
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-47}` : `Song ${(matchNum-48) * 4 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Elite 8 - Region 1 - Always visible */}
                <BracketMatch
                  matchupClass="matchup-57"
                  player1={{ name: 'Winner', score: 89 }}
                  player2={{ name: 'Winner', score: 82 }}
                />
              </div>

              {/* Region 2 */}
              <div className={`${styles.region} ${styles['region-2']}`}>
                {/* Round 1 - Only visible in 64-player bracket */}
                {bracketSize === 64 && [9, 10, 11, 12, 13, 14, 15, 16].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 - Visible in 32 and 64-player brackets */}
                {(bracketSize >= 32) && [37, 38, 39, 40].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-36}` : `Song ${(matchNum-36) * 2 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-35}` : `Song ${(matchNum-36) * 2}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Sweet 16 - Always visible */}
                {[51, 52].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-50}` : `Song ${(matchNum-50) * 4 - 3}`,
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-49}` : `Song ${(matchNum-50) * 4 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Elite 8 - Region 2 - Always visible */}
                <BracketMatch
                  matchupClass="matchup-58"
                  player1={{ name: 'Winner', score: 91 }}
                  player2={{ name: 'Winner', score: 87 }}
                />
              </div>

              {/* Region 3 */}
              <div className={`${styles.region} ${styles['region-3']}`}>
                {/* Round 1 - Only visible in 64-player bracket */}
                {bracketSize === 64 && [17, 18, 19, 20, 21, 22, 23, 24].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 - Visible in 32 and 64-player brackets */}
                {(bracketSize >= 32) && [41, 42, 43, 44].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-40}` : `Song ${(matchNum-40) * 2 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-39}` : `Song ${(matchNum-40) * 2}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Sweet 16 - Always visible */}
                {[53, 54].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-52}` : `Song ${(matchNum-52) * 4 - 3}`,
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-51}` : `Song ${(matchNum-52) * 4 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Elite 8 - Region 3 - Always visible */}
                <BracketMatch
                  matchupClass="matchup-59"
                  player1={{ name: 'Winner', score: 94 }}
                  player2={{ name: 'Winner', score: 88 }}
                />
              </div>

              {/* Region 4 */}
              <div className={`${styles.region} ${styles['region-4']}`}>
                {/* Round 1 - Only visible in 64-player bracket */}
                {bracketSize === 64 && [25, 26, 27, 28, 29, 30, 31, 32].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 - Visible in 32 and 64-player brackets */}
                {(bracketSize >= 32) && [45, 46, 47, 48].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-44}` : `Song ${(matchNum-44) * 2 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize === 64 ? `Winner R1 ${matchNum-43}` : `Song ${(matchNum-44) * 2}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Sweet 16 - Always visible */}
                {[55, 56].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-54}` : `Song ${(matchNum-54) * 4 - 3}`,
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                    player2={{ 
                      name: bracketSize >= 32 ? `Winner R2 ${matchNum-53}` : `Song ${(matchNum-54) * 4 - 1}`, 
                      score: Math.floor(Math.random() * 40) + 60 
                    }}
                  />
                ))}

                {/* Elite 8 - Region 4 - Always visible */}
                <BracketMatch
                  matchupClass="matchup-60"
                  player1={{ name: 'Winner', score: 93 }}
                  player2={{ name: 'Winner', score: 90 }}
                />
              </div>

              {/* Final Four */}
              <div className={styles['final-four']}>
                {/* Final Four Game 1 (Semi-final) */}
                <BracketMatch
                  matchupClass="matchup-61"
                  player1={{ name: 'Region 1', score: 85 }}
                  player2={{ name: 'Region 2', score: 78 }}
                />

                {/* Final Four Game 2 (Semi-final) */}
                <BracketMatch
                  matchupClass="matchup-62"
                  player1={{ name: 'Region 3', score: 92 }}
                  player2={{ name: 'Region 4', score: 89 }}
                />

                {/* Championship */}
                <BracketMatch
                  matchupClass="championship"
                  player1={{ name: 'East Winner', score: 88 }}
                  player2={{ name: 'West Winner', score: 95 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
