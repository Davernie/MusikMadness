import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TournamentBracket.module.css';

// Interface for bracket matches
interface BracketMatchProps {
  player1: { name: string; score: number };
  player2: { name: string; score: number };
  matchupClass: string;
  matchupId?: string; // Added matchupId for navigation
}

/**
 * BracketMatch component represents a single matchup in the tournament bracket
 * When clicked, it navigates to the detailed matchup page
 */
const BracketMatch: React.FC<BracketMatchProps> = ({ player1, player2, matchupClass, matchupId }) => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams<{ id: string }>();
  const [isClicked, setIsClicked] = useState(false);
  
  const handleMatchupClick = () => {
    setIsClicked(true);
    
    // Use the matchupId if provided, otherwise use the matchupClass as an identifier
    const targetId = matchupId || matchupClass;
    
    // Add a short delay for click animation
    setTimeout(() => {
      navigate(`/tournaments/${tournamentId}/matchups/${targetId}`);
      setIsClicked(false);
    }, 150);
  };
  
  // Determine winner
  const player1IsWinner = player1.score > player2.score;
  const player2IsWinner = player2.score > player1.score;
  
  // If both scores are zero, this is likely an upcoming match
  const isUpcoming = player1.score === 0 && player2.score === 0;

  return (
    <ul 
      className={`${styles.matchup} ${styles[matchupClass]} cursor-pointer 
        hover:opacity-90 transition-all duration-200
        ${isClicked ? 'scale-95' : ''}
        ${isUpcoming ? 'opacity-70' : ''}
      `}
      onClick={handleMatchupClick}
      title={isUpcoming ? "Upcoming matchup" : "Click to view matchup details"}
    >
      <li className={`${styles.team} ${styles.teamTop} ${player1IsWinner ? styles.winner : ''}`}>
        {player1.name} <span className={styles.score}>{player1.score || '-'}</span>
      </li>
      <li className={`${styles.team} ${player2IsWinner ? styles.winner : ''}`}>
        {player2.name} <span className={styles.score}>{player2.score || '-'}</span>
      </li>
    </ul>
  );
};

export default BracketMatch;
