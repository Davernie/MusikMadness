import React from 'react';
import styles from './TournamentBracket.module.css';

interface BracketMatchupProps {
  team1: {
    name: string;
    score: number;
  };
  team2: {
    name: string;
    score: number;
  };
}

const BracketMatchup: React.FC<BracketMatchupProps> = ({ team1, team2 }) => (
  <div className={styles.matchup}>
    <div className={styles.team}>
      {team1.username} <span className={styles.score}>{team1.score}</span>
    </div>
    <div className={styles.team}>
      {team2.username} <span className={styles.score}>{team2.score}</span>
    </div>
  </div>
);

export default BracketMatchup;
