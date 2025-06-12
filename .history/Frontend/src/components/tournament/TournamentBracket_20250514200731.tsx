import React from 'react';
import { Music } from 'lucide-react';
import styles from './TournamentBracket.module.css';

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
}

const Matchup: React.FC<MatchupProps> = ({ player1, player2 }) => (
  <div className="flex flex-col gap-2">
    <div className={`relative flex items-center gap-3 p-3 rounded-lg ${
      player1.score > player2.score 
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
        : 'bg-gray-800/40 border border-white/10'
    } backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group`}>
      {player1.image ? (
        <img src={player1.image} alt={player1.username} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-700/50 flex items-center justify-center">
          <Music className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-white font-medium leading-none mb-1">{player1.username}</h3>
        <p className="text-sm text-gray-400">{player1.artist}</p>
      </div>
      <div className="bg-black/40 px-2 py-1 rounded text-sm">
        {player1.score}%
      </div>
      {player1.rarity && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {player1.rarity}
        </span>
      )}
    </div>
    
    <div className={`relative flex items-center gap-3 p-3 rounded-lg ${
      player2.score > player1.score 
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
        : 'bg-gray-800/40 border border-white/10'
    } backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group`}>
      {player2.image ? (
        <img src={player2.image} alt={player2.username} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-700/50 flex items-center justify-center">
          <Music className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-white font-medium leading-none mb-1">{player2.username}</h3>
        <p className="text-sm text-gray-400">{player2.artist}</p>
      </div>
      <div className="bg-black/40 px-2 py-1 rounded text-sm">
        {player2.score}%
      </div>
      {player2.rarity && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {player2.rarity}
        </span>
      )}
    </div>
  </div>
);

const BracketMatch: React.FC<MatchupProps> = ({ player1, player2 }) => (
  <ul className={styles.matchup}>
    <li className={`${styles.team} ${styles.teamTop} ${player1.score > player2.score ? styles.winner : ''}`}>
      {player1.username} <span className={styles.score}>{player1.score}%</span>
    </li>
    <li className={`${styles.team} ${player2.score > player1.score ? styles.winner : ''}`}>
      {player2.username} <span className={styles.score}>{player2.score}%</span>
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
        <div className={styles.region}>
          {/* Add your BracketMatch components here with proper grid positioning */}
          <BracketMatch 
            player1={{
              name: "Ready For It?",
              artist: "Taylor Swift",
              score: 79,
              rarity: "RARE"
            }}
            player2={{
              name: "Diet Pepsi",
              artist: "Addison Rae",
              score: 21,
              rarity: "RARE"
            }}
          />
          {/* Add more matches */}
        </div>

        {/* Add remaining regions and final four section */}
      </div>
    </>
  );
};

export default TournamentBracket;
