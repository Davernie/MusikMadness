import React from 'react';
// import { Trophy } from 'lucide-react'; // No longer needed
import BracketImage from '../../assets/images/GZYKbRzWQAAN3wE.png'; // IMPORT THE IMAGE

interface Participant {
  name: string;
  avatar?: string;
}

interface MatchParticipant extends Participant {
  score?: number;
  isWinner?: boolean;
}

interface Match {
  id: string;
  participants: MatchParticipant[];
  round: number;
  matchNumber: number;
  completed: boolean;
}

interface TournamentBracketProps {
  title: string;
  colors: { primary: string; secondary: string; accent: string };
  matches?: Match[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  title,
  colors,
  matches = []
}) => {
  // Generate some sample matches if none provided
  // const sampleMatches: Match[] = matches.length > 0 ? matches : [ // DELETE ALL THIS LOGIC
  //   // Round 1 (Quarter Finals)
  //   { id: '1', participants: [{ name: 'Alex Johnson', score: 85, isWinner: true }, { name: 'Maria Garcia', score: 78 }], round: 1, matchNumber: 1, completed: true },
  //   { id: '2', participants: [{ name: 'James Wilson', score: 92, isWinner: true }, { name: 'Sarah Lee', score: 88 }], round: 1, matchNumber: 2, completed: true },
  //   { id: '3', participants: [{ name: 'David Kim', score: 76 }, { name: 'Emma Davis', score: 81, isWinner: true }], round: 1, matchNumber: 3, completed: true },
  //   { id: '4', participants: [{ name: 'Michael Brown', score: 89, isWinner: true }, { name: 'Olivia Taylor', score: 84 }], round: 1, matchNumber: 4, completed: true },
    
  //   // Round 2 (Semi Finals)
  //   { id: '5', participants: [{ name: 'Alex Johnson', score: 88 }, { name: 'James Wilson', score: 91, isWinner: true }], round: 2, matchNumber: 1, completed: true },
  //   { id: '6', participants: [{ name: 'Emma Davis', score: 86 }, { name: 'Michael Brown', score: 90, isWinner: true }], round: 2, matchNumber: 2, completed: true },
    
  //   // Round 3 (Finals)
  //   { id: '7', participants: [{ name: 'James Wilson', score: 94, isWinner: true }, { name: 'Michael Brown', score: 92 }], round: 3, matchNumber: 1, completed: true },
  // ];

  // // Group matches by round
  // const matchesByRound = sampleMatches.reduce((acc, match) => {
  //   if (!acc[match.round]) {
  //     acc[match.round] = [];
  //   }
  //   acc[match.round].push(match);
  //   return acc;
  // }, {} as Record<number, Match[]>);

  // const rounds = Object.keys(matchesByRound).map(Number).sort();
  // const maxRound = Math.max(...rounds); // END DELETE ALL THIS LOGIC

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 w-full max-w-50xl mx-auto">

      {/* Gradient accent line */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.3), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.3))`,
        }}
      ></div>
      
      <div className="p-6">        <h2 className="text-xl mb-5" style={{ 
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: `rgb(${colors.primary})`,
            textShadow: `0 0 10px rgba(${colors.primary}, 0.1), 0 0 20px rgba(${colors.primary}, 0.1)`,
            letterSpacing: '3px'
          }}>
          Tournament Bracket
        </h2>
        
        {/* Remove style tag and existing bracket rendering */}
        {/* <style>...</style> */}
        
        {/* <div className="relative overflow-x-auto"> */}
        {/*   <div className="flex justify-between min-w-[800px]"> */}
        {/*     ... rounds.map ... */}
        {/*   </div> */}
        {/* </div> */}
        
        {/* Display the image instead */}
        <div className="flex justify-center items-center p-4">
          <img src={BracketImage} alt="Tournament Bracket" className="max-w-full h-auto rounded-md" />
        </div>
        
        {/* Remove Winner celebration for the final match */}
        {/* {sampleMatches.find(m => m.round === maxRound)?.participants.find(p => p.isWinner) && ( ... )} */}
      </div>
    </div>
  );
};

export default TournamentBracket;