import React from 'react';
import styles from './TournamentBracket.module.css';

// Static interface for bracket matches
interface MatchupProps {
  player1: { name: string; score: number };
  player2: { name: string; score: number };
  matchupClass: string;
}

interface MatchupProps {
  player1: { name: string; score: number };
  player2: { name: string; score: number };
  matchupClass: string;
}

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
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative z-10 py-4 w-full max-w-[2400px]">
        <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10 min-w-[2000px]">
          <header>
            <ol>
              <li>Round 1A<br/><span>Mar 16/17</span></li>
              <li>Round 2A<br/><span>Mar 18/19</span></li>
              <li>Round 3A<br/><span>Mar 23/24</span></li>
              <li>QTR Final<br/><span>Mar 25/26</span></li>
              <li>Finals<br/><span>Apr 1/3</span></li>
              <li>QTR Final<br/><span>Mar 25/26</span></li>
              <li>Round 3B<br/><span>Mar 23/24</span></li>
              <li>Round 2B<br/><span>Mar 18/19</span></li>
              <li>Round 1B<br/><span>Mar 16/17</span></li>
            </ol>
          </header>

          {/* Gradient accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500/80 via-purple-500/40 to-pink-500/20"></div>

          <div className="p-3 md:p-4">
            <div className={styles.bracket}>
              <figure className={styles.logo}>
                <img src="/src/assets/images/SmallMM_Transparent.png" alt="Tournament Logo" />
              </figure>

              {/* Region 1 */}
              <div className={`${styles.region} ${styles['region-1']}`}>
                {/* Round 1 */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 */}
                {[33, 34, 35, 36].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R1 ${matchNum-32}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R1 ${matchNum-31}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Sweet 16 */}
                {[49, 50].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R2 ${matchNum-48}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R2 ${matchNum-47}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Elite 8 */}
                <BracketMatch
                  matchupClass="matchup-57"
                  player1={{ name: 'Winner Sweet 16 1', score: 0 }}
                  player2={{ name: 'Winner Sweet 16 2', score: 0 }}
                />
              </div>

              {/* Region 2 */}
              <div className={`${styles.region} ${styles['region-2']}`}>
                {/* Round 1 */}
                {[9, 10, 11, 12, 13, 14, 15, 16].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 */}
                {[37, 38, 39, 40].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R1 ${matchNum-36}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R1 ${matchNum-35}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Sweet 16 */}
                {[51, 52].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R2 ${matchNum-50}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R2 ${matchNum-49}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Elite 8 */}
                <BracketMatch
                  matchupClass="matchup-58"
                  player1={{ name: 'Winner Sweet 16 3', score: 0 }}
                  player2={{ name: 'Winner Sweet 16 4', score: 0 }}
                />
              </div>

              {/* Region 3 */}
              <div className={`${styles.region} ${styles['region-3']}`}>
                {/* Round 1 */}
                {[17, 18, 19, 20, 21, 22, 23, 24].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 */}
                {[41, 42, 43, 44].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R1 ${matchNum-40}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R1 ${matchNum-39}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Sweet 16 */}
                {[53, 54].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R2 ${matchNum-52}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R2 ${matchNum-51}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Elite 8 */}
                <BracketMatch
                  matchupClass="matchup-59"
                  player1={{ name: 'Winner Sweet 16 5', score: 0 }}
                  player2={{ name: 'Winner Sweet 16 6', score: 0 }}
                />
              </div>

              {/* Region 4 */}
              <div className={`${styles.region} ${styles['region-4']}`}>
                {/* Round 1 */}
                {[25, 26, 27, 28, 29, 30, 31, 32].map((matchNum) => (
                  <BracketMatch
                    key={`r1-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Song ${matchNum * 2 - 1}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Song ${matchNum * 2}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Round 2 */}
                {[45, 46, 47, 48].map((matchNum) => (
                  <BracketMatch
                    key={`r2-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R1 ${matchNum-44}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R1 ${matchNum-43}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Sweet 16 */}
                {[55, 56].map((matchNum) => (
                  <BracketMatch
                    key={`r3-${matchNum}`}
                    matchupClass={`matchup-${matchNum}`}
                    player1={{ name: `Winner R2 ${matchNum-54}`, score: Math.floor(Math.random() * 40) + 60 }}
                    player2={{ name: `Winner R2 ${matchNum-53}`, score: Math.floor(Math.random() * 40) + 60 }}
                  />
                ))}

                {/* Elite 8 */}
                <BracketMatch
                  matchupClass="matchup-60"
                  player1={{ name: 'Winner Sweet 16 7', score: 0 }}
                  player2={{ name: 'Winner Sweet 16 8', score: 0 }}
                />
              </div>

              {/* Final Four */}
              <div className={styles['final-four']}>
                {/* Final Four Game 1 */}
                <BracketMatch
                  matchupClass="matchup-61"
                  player1={{ name: 'Winner Region 1', score: 0 }}
                  player2={{ name: 'Winner Region 2', score: 0 }}
                />

                {/* Final Four Game 2 */}
                <BracketMatch
                  matchupClass="matchup-62"
                  player1={{ name: 'Winner Region 3', score: 0 }}
                  player2={{ name: 'Winner Region 4', score: 0 }}
                />

                {/* Championship */}
                <BracketMatch
                  matchupClass="championship"
                  player1={{ name: 'Finalist 1', score: 0 }}
                  player2={{ name: 'Finalist 2', score: 0 }}
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
