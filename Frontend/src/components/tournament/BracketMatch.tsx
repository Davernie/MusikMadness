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
      navigate(`/tournaments/${tournamentId}/matchup/${targetId}`);
      setIsClicked(false);
    }, 150);
  };
  
  // Determine winner and matchup state
  const player1IsWinner = player1.score > player2.score;
  const player2IsWinner = player2.score > player1.score;
  const hasWinner = player1IsWinner || player2IsWinner;
  
  // Determine matchup state for visual indicators
  const isUpcoming = player1.score === 0 && player2.score === 0 && isTrulyNavigable && !hasWinner;
  const isActive = isTrulyNavigable && !hasWinner && (player1.id !== null && player2.id !== null);
  const isCompleted = hasWinner;
  const isPlaceholder = !isTrulyNavigable || (player1.id === null && player2.id === null);

  // Determine matchup state class
  let matchupStateClass = '';
  if (isActive) matchupStateClass = 'active';
  else if (isUpcoming) matchupStateClass = 'upcoming';
  else if (isCompleted) matchupStateClass = 'completed';

  const baseClasses = `${styles.matchup} ${styles[matchupClass]}`;
  const stateClasses = matchupStateClass ? styles[matchupStateClass] : '';
  const interactiveClasses = isTrulyNavigable 
    ? `cursor-pointer hover:opacity-90 transition-all duration-200 ${isClicked ? 'scale-95' : ''}` 
    : 'cursor-default opacity-40'; // Dimmed more for non-navigable
  
  // Adjust opacity: full for active navigable, 70 for upcoming, and let interactiveClasses handle non-navigable
  const opacityStyle = isUpcoming ? 'opacity-70' : (isTrulyNavigable ? 'opacity-100' : ''); 

  // Determine team state classes
  const getTeamStateClass = (isWinner: boolean) => {
    if (isWinner) return styles.winner;
    if (isActive) return styles.active;
    if (isUpcoming) return styles.upcoming;
    if (isCompleted) return styles.completed;
    return '';
  };

  return (
    <ul 
      className={`${baseClasses} ${stateClasses} ${interactiveClasses} ${opacityStyle}`}
      onClick={isTrulyNavigable ? handleMatchupClick : undefined}
      title={
        isTrulyNavigable 
          ? (isActive ? "Active matchup - Click to view details" 
             : isUpcoming ? "Upcoming matchup - Click to view details" 
             : isCompleted ? "Completed matchup - Click to view details"
             : "Click to view matchup details") 
          : "Matchup not yet determined or contains a BYE"
      }
    >
      <li className={`${styles.team} ${styles.teamTop} ${getTeamStateClass(player1IsWinner)}`}>
        {player1.name} <span className={styles.score}>{player1.score || '-'}</span>
      </li>
      <li className={`${styles.team} ${getTeamStateClass(player2IsWinner)}`}>
        {player2.name} <span className={styles.score}>{player2.score || '-'}</span>
      </li>
    </ul>
  );
};

export default BracketMatch;
