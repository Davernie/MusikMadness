import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TournamentBracket.module.css';

// Interface for bracket matches
interface BracketMatchProps {
  player1: { name: string; score: number; id: string | null };
  player2: { name: string; score: number; id: string | null };
  matchupClass: string;
  matchupId?: string;
}

/**
 * BracketMatch component represents a single matchup in the tournament bracket
 * When clicked, it navigates to the detailed matchup page *if* it represents a valid, non-BYE matchup.
 */
const BracketMatch: React.FC<BracketMatchProps> = ({ player1, player2, matchupClass, matchupId }) => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams<{ id: string }>();
  const [isClicked, setIsClicked] = useState(false);
  
  // Determine if the matchup is clickable (i.e., not a BYE vs BYE or placeholder vs placeholder)
  // A matchup is considered non-navigable if both players have null IDs (common for higher round placeholders)
  // or if at least one player's name is explicitly 'BYE'.
  const isNavigable = 
    (player1.id !== null || player2.id !== null) && // At least one player must have an ID (not placeholder vs placeholder)
    player1.name.toUpperCase() !== 'BYE' && 
    player2.name.toUpperCase() !== 'BYE';
    // If a BYE exists, one player will have an ID, the other will be null with name 'BYE'.
    // We allow navigation if one player is real and the other is a BYE for now,
    // as the backend/matchup page might handle this. If not, add: `&& player1.id !== null && player2.id !== null`
    // For now, the main goal is to stop clicks on fully placeholder matches or matches clearly involving a BYE from navigating.
    // Let's refine: a matchup is navigable if at least one player is NOT a BYE and has an ID.
    // And specifically, if matchupId is present (meaning it's a real potential matchup)
    // AND not both players are placeholders (id: null).

  // Refined logic: Navigable if matchupId is present AND ( (p1 is not BYE and has ID) OR (p2 is not BYE and has ID) )
  // And not both players are simply placeholders like "Winner R1M1"
  const isTrulyNavigable = matchupId && 
                           ( (player1.id !== null && player1.name.toUpperCase() !== 'BYE') || 
                             (player2.id !== null && player2.name.toUpperCase() !== 'BYE') ) &&
                           !(player1.id === null && player2.id === null); // Not placeholder vs placeholder

  const handleMatchupClick = () => {
    if (!isTrulyNavigable || !matchupId) return; // Only navigate if it's a valid, non-placeholder/non-BYE matchup with an ID

    setIsClicked(true);
    const targetId = matchupId; // Use matchupId directly as we checked it
    
    setTimeout(() => {
      navigate(`/tournaments/${tournamentId}/matchups/${targetId}`);
      setIsClicked(false);
    }, 150);
  };
  
  // Determine winner
  const player1IsWinner = player1.score > player2.score;
  const player2IsWinner = player2.score > player1.score;
  
  // If both scores are zero, this is likely an upcoming match
  const isUpcoming = player1.score === 0 && player2.score === 0 && isTrulyNavigable;

  const baseClasses = `${styles.matchup} ${styles[matchupClass]}`;
  const interactiveClasses = isTrulyNavigable 
    ? `cursor-pointer hover:opacity-90 transition-all duration-200 ${isClicked ? 'scale-95' : ''}` 
    : 'cursor-default opacity-40'; // Dimmed more for non-navigable
  
  // Adjust opacity: full for active navigable, 70 for upcoming, and let interactiveClasses handle non-navigable
  const opacityStyle = isUpcoming ? 'opacity-70' : (isTrulyNavigable ? 'opacity-100' : ''); 

  return (
    <ul 
      className={`${baseClasses} ${interactiveClasses} ${opacityStyle}`}
      onClick={isTrulyNavigable ? handleMatchupClick : undefined}
      title={isTrulyNavigable ? (isUpcoming ? "Upcoming matchup" : "Click to view matchup details") : "Matchup not yet determined or contains a BYE"}
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
