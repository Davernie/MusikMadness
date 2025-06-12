import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TournamentBracket.module.css';
import styles32 from './TournamentBracket32.module.css';
import styles16 from './TournamentBracket16.module.css';
import styles8 from './TournamentBracket8.module.css';
import styles4 from './TournamentBracket4.module.css';
import styles2 from './TournamentBracket2.module.css';

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
  
  // Determine bracket type and use appropriate styles based on the matchupClass
  const is32Bracket = matchupClass.startsWith('matchup32-') || matchupClass === 'championship32';
  const is16Bracket = matchupClass.startsWith('matchup16-') || matchupClass === 'championship16';
  const is8Bracket = matchupClass.startsWith('matchup8-') || matchupClass === 'championship8';
  const is4Bracket = matchupClass.startsWith('matchup4-') || matchupClass === 'championship4';
  const is2Bracket = matchupClass.startsWith('matchup2-') || matchupClass === 'championship2';
  
  const currentStyles = is32Bracket ? styles32 
                       : is16Bracket ? styles16 
                       : is8Bracket ? styles8 
                       : is4Bracket ? styles4 
                       : is2Bracket ? styles2 
                       : styles;
  
  // Convert IDs to strings and ensure they're not null/undefined/empty
  const player1Id = player1.id ? String(player1.id).trim() : null;
  const player2Id = player2.id ? String(player2.id).trim() : null;
  
  // Debug logging for non-clickable matchups
  const hasMatchupId = !!matchupId;
  const hasValidIds = player1Id && player2Id && player1Id !== 'null' && player2Id !== 'null';
  const notBye = player1.username.toUpperCase() !== 'BYE' && player2.username.toUpperCase() !== 'BYE';
  const notWinner = !player1.username.toLowerCase().includes('winner') && !player2.username.toLowerCase().includes('winner');
  const notTbd = !player1.username.toLowerCase().includes('tbd') && !player2.username.toLowerCase().includes('tbd');
  
  // More permissive logic: Allow matchups with valid matchupId and real names even if IDs are problematic
  // This covers ongoing tournaments where some data might be missing but the matchup is still valid
  const hasRealPlayers = notBye && notWinner && notTbd && 
                         player1.username.trim().length > 0 && 
                         player2.username.trim().length > 0 &&
                         !player1.username.toLowerCase().includes('placeholder') &&
                         !player2.username.toLowerCase().includes('placeholder');
  
  const isTrulyNavigable = hasMatchupId && hasRealPlayers && (hasValidIds || 
    // Allow navigation even with missing IDs if we have real player names and matchupId
    (player1.username && player2.username && !player1.username.includes('Winner') && !player2.username.includes('Winner')));
  
  const handleMatchupClick = () => {
    if (!isTrulyNavigable || !matchupId || !tournamentId) return;

    setIsClicked(true);
    
    setTimeout(() => {
      navigate(`/tournaments/${tournamentId}/matchup/${matchupId}`);
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

  // Use appropriate matchup class names based on bracket type
  const matchupClassKey = is32Bracket ? 'matchup32' 
                         : is16Bracket ? 'matchup16' 
                         : is8Bracket ? 'matchup8' 
                         : is4Bracket ? 'matchup4' 
                         : is2Bracket ? 'matchup2' 
                         : 'matchup';
  const baseMatchupClass = currentStyles[matchupClassKey] || '';
  const specificMatchupClass = currentStyles[matchupClass] || '';
  const baseClasses = `${baseMatchupClass} ${specificMatchupClass}`;
  const stateClasses = matchupStateClass ? (currentStyles[matchupStateClass] || '') : '';
  const interactiveClasses = isTrulyNavigable 
    ? `cursor-pointer hover:opacity-90 transition-all duration-200 ${isClicked ? 'scale-95' : ''}` 
    : 'cursor-default opacity-40'; // Dimmed more for non-navigable
  
  // Adjust opacity: full for active navigable, 70 for upcoming, and let interactiveClasses handle non-navigable
  const opacityStyle = isUpcoming ? 'opacity-70' : (isTrulyNavigable ? 'opacity-100' : ''); 

  // Determine team state classes using appropriate style object
  const getTeamStateClass = (isWinner: boolean, isTopPlayer: boolean = false) => {
    const winnerClass = is32Bracket ? 'winner32' 
                       : is16Bracket ? 'winner16' 
                       : is8Bracket ? 'winner8' 
                       : is4Bracket ? 'winner4' 
                       : is2Bracket ? 'winner2' 
                       : 'winner';
    if (isWinner) return currentStyles[winnerClass] || '';
    if (isActive) {
      // Use different active classes for top and bottom participants
      if (isTopPlayer) {
        return currentStyles.activeTop || currentStyles.active || '';
      } else {
        return currentStyles.activeBottom || currentStyles.active || '';
      }
    }
    if (isUpcoming) return currentStyles.upcoming || '';
    if (isCompleted) return currentStyles.completed || '';
    return '';
  };

  // Use appropriate team class
  const teamClass = is32Bracket ? 'team32' 
                   : is16Bracket ? 'team16' 
                   : is8Bracket ? 'team8' 
                   : is4Bracket ? 'team4' 
                   : is2Bracket ? 'team2' 
                   : 'team';
  const teamTopClass = currentStyles.teamTop || '';
  const scoreClass = currentStyles.score || '';

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
      <li className={`${currentStyles[teamClass] || ''} ${teamTopClass} ${getTeamStateClass(player1IsWinner, true)}`}>
        {player1.username} <span className={scoreClass}>{player1.score || '-'}</span>
      </li>
      <li className={`${currentStyles[teamClass] || ''} ${getTeamStateClass(player2IsWinner, false)}`}>
        {player2.username} <span className={scoreClass}>{player2.score || '-'}</span>
      </li>
    </ul>
  );
};

export default BracketMatch;
