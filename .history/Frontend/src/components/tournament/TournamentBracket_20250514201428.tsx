import React from 'react';
import styles from './TournamentBracket.module.css';

// Mock data for 64 players
const mockTournamentData = {
  round1: Array.from({ length: 32 }, (_, i) => ({
    player1: {
      name: `Song ${i * 2 + 1}`,
      artist: `Artist ${i * 2 + 1}`,
      score: Math.floor(Math.random() * 40) + 60,
      rarity: Math.random() > 0.7 ? "RARE" : undefined
    },
    player2: {
      name: `Song ${i * 2 + 2}`,
      artist: `Artist ${i * 2 + 2}`,
      score: Math.floor(Math.random() * 40) + 60,
      rarity: Math.random() > 0.7 ? "RARE" : undefined
    }
  }))
};

interface MatchupProps {
  player1: {
    name: string;
    artist: string;
    image?: string;
    score: number;
    rarity?: string;
  };
  player2: {
    name: string;
    artist: string;
    image?: string;
    score: number;
    rarity?: string;
  };
  matchupClass?: string;
}

const BracketMatch: React.FC<MatchupProps> = ({ player1, player2, matchupClass }) => (
  <ul className={`${styles.matchup} ${matchupClass ? styles[matchupClass] : ''}`}>
    <li className={`${styles.team} ${styles.teamTop} ${player1.score > player2.score ? styles.winner : ''}`}>
      {player1.name} <span className={styles.score}>{player1.score}%</span>
    </li>
    <li className={`${styles.team} ${player2.score > player1.score ? styles.winner : ''}`}>
      {player2.name} <span className={styles.score}>{player2.score}%</span>
    </li>
  </ul>
);

const TournamentBracket: React.FC = () => {
  return (
    <>
      <header className={styles.bracketHeader}>
        <ol className={styles.roundLabels}>
          <li className={styles.roundLabel}>Round 1<br/><span>Mar 16</span></li>
          <li className={styles.roundLabel}>Round 2<br/><span>Mar 18</span></li>
          <li className={styles.roundLabel}>Sweet 16<br/><span>Mar 23</span></li>
          <li className={styles.roundLabel}>Elite 8<br/><span>Mar 25</span></li>
          <li className={styles.roundLabel}>Finals<br/><span>Apr 1</span></li>
          <li className={styles.roundLabel}>Elite 8<br/><span>Mar 25</span></li>
          <li className={styles.roundLabel}>Sweet 16<br/><span>Mar 23</span></li>
          <li className={styles.roundLabel}>Round 2<br/><span>Mar 18</span></li>
          <li className={styles.roundLabel}>Round 1<br/><span>Mar 16</span></li>
        </ol>
      </header>

      <div className={styles.bracket}>
        {/* Region 1 */}
        <div className={`${styles.region} ${styles['region-1']}`}>
          {mockTournamentData.round1.slice(0, 8).map((matchup, index) => (
            <BracketMatch
              key={`region1-${index}`}
              matchupClass={`matchup-${index + 1}`}
              {...matchup}
            />
          ))}
        </div>

        {/* Region 2 */}
        <div className={`${styles.region} ${styles['region-2']}`}>
          {mockTournamentData.round1.slice(8, 16).map((matchup, index) => (
            <BracketMatch
              key={`region2-${index}`}
              matchupClass={`matchup-${index + 9}`}
              {...matchup}
            />
          ))}
        </div>

        {/* Region 3 */}
        <div className={`${styles.region} ${styles['region-3']}`}>
          {mockTournamentData.round1.slice(16, 24).map((matchup, index) => (
            <BracketMatch
              key={`region3-${index}`}
              matchupClass={`matchup-${index + 17}`}
              {...matchup}
            />
          ))}
        </div>

        {/* Region 4 */}
        <div className={`${styles.region} ${styles['region-4']}`}>
          {mockTournamentData.round1.slice(24, 32).map((matchup, index) => (
            <BracketMatch
              key={`region4-${index}`}
              matchupClass={`matchup-${index + 25}`}
              {...matchup}
            />
          ))}
        </div>

        {/* Final Four */}
        <div className={styles['final-four']}>
          <BracketMatch
            matchupClass="championship"
            player1={{
              name: "Finalist 1",
              artist: "Artist A",
              score: 50,
            }}
            player2={{
              name: "Finalist 2",
              artist: "Artist B",
              score: 50,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TournamentBracket;
