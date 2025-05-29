import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TournamentBracket.module.css';
import styles32 from './TournamentBracket32.module.css';
import styles16 from './TournamentBracket16.module.css';
import styles8 from './TournamentBracket8.module.css';
import styles4 from './TournamentBracket4.module.css';
import styles2 from './TournamentBracket2.module.css';

interface BracketMatchProps {
  player1: { name: string; score: number; id: string | null };
  player2: { name: string; score: number; id: string | null };
  matchupClass: string;
  matchupId?: string;
}

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
  const notBye = player1.name.toUpperCase() !== 'BYE' && player2.name.toUpperCase() !== 'BYE';
  const notWinner = !player1.name.toLowerCase().includes('winner') && !player2.name.toLowerCase().includes('winner');
  const notTbd = !player1.name.toLowerCase().includes('tbd') && !player2.name.toLowerCase().includes('tbd');
  
  // Check if this is a BYE matchup
  const isByeMatchup = player1.name.toUpperCase() === 'BYE' || player2.name.toUpperCase() === 'BYE';
  
  // More permissive logic: Allow matchups with valid matchupId and real names even if IDs are problematic
  // This covers ongoing tournaments where some data might be missing but the matchup is still valid
  const hasRealPlayers = notBye && notWinner && notTbd && 
                         player1.name.trim().length > 0 && 
                         player2.name.trim().length > 0 &&
                         !player1.name.toLowerCase().includes('placeholder') &&
                         !player2.name.toLowerCase().includes('placeholder');
  
  const isTrulyNavigable = hasMatchupId && hasRealPlayers && (hasValidIds || 
    // Allow navigation even with missing IDs if we have real player names and matchupId
    (player1.name && player2.name && !player1.name.includes('Winner') && !player2.name.includes('Winner')));
  
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
  const isPlaceholder = !isTrulyNavigable && !isByeMatchup && (player1.id === null && player2.id === null);

  // Determine matchup state class


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
    : isByeMatchup 
      ? 'cursor-default opacity-100' // BYE matchups appear normal but not clickable
      : 'cursor-default opacity-40'; // Other non-navigable matchups are dimmed
  
  // Adjust opacity: full for active navigable and BYE matchups, 70 for upcoming, and let interactiveClasses handle others
  const opacityStyle = isUpcoming ? 'opacity-70' : (isTrulyNavigable || isByeMatchup ? 'opacity-100' : ''); 

  // Determine team state classes using appropriate style object
  const getTeamStateClass = (isWinner: boolean) => {
    const winnerClass = is32Bracket ? 'winner32' 
                       : is16Bracket ? 'winner16' 
                       : is8Bracket ? 'winner8' 
                       : is4Bracket ? 'winner4' 
                       : is2Bracket ? 'winner2' 
                       : 'winner';
    if (isWinner) return currentStyles[winnerClass] || '';
    if (isActive) return currentStyles.active || '';
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

  // Special handling for championship matchups
  const isChampionship = matchupClass.includes('championship');

  return (
    <ul 
      className={`${baseClasses} ${stateClasses} ${interactiveClasses} ${opacityStyle}`}
      onClick={isTrulyNavigable ? handleMatchupClick : undefined}
      title={
        isTrulyNavigable 
          ? (isChampionship ? "Championship Final - Click to view details"
             : isActive ? "Active matchup - Click to view details" 
             : isUpcoming ? "Upcoming matchup - Click to view details" 
             : isCompleted ? "Completed matchup - Click to view details"
             : "Click to view matchup details") 
          : isByeMatchup
            ? "BYE - Player advances automatically"
            : "Matchup not yet determined or contains a BYE"
      }
    >
      <li className={`${currentStyles[teamClass] || ''} ${teamTopClass} ${getTeamStateClass(player1IsWinner)}`}>
        {player1.name} <span className={scoreClass}>{player1.score || '-'}</span>
      </li>
      <li className={`${currentStyles[teamClass] || ''} ${getTeamStateClass(player2IsWinner)}`}>
        {player2.name} <span className={scoreClass}>{player2.score || '-'}</span>
      </li>
    </ul>
  );
};

export default BracketMatch;
