import React from 'react';
import styles from './TournamentBracket.module.css';
import { Music } from 'lucide-react';

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
  <div className="flex flex-col gap-2 relative w-[300px]">
    <div className={`relative flex items-center gap-3 p-3 rounded-lg ${
      player1.score > player2.score 
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
        : 'bg-gray-800/40 border border-white/10'
    } backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60 group`}>
      {player1.image ? (
        <img src={player1.image} alt={player1.name} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-700/50 flex items-center justify-center">
          <Music className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-white font-medium leading-none mb-1">{player1.name}</h3>
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
        <img src={player2.image} alt={player2.name} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-700/50 flex items-center justify-center">
          <Music className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-white font-medium leading-none mb-1">{player2.name}</h3>
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

const TournamentBracket: React.FC = () => {
  return (
    <section className={styles.bracket}>
      <div className={styles.container}>
        <div className={`${styles.split} ${styles.splitOne}`}>
          <div className={`${styles.round} ${styles.roundOne}`}>
            <div className={styles.roundDetails}>Round 1</div>
            <div className={styles.matchup}>
              <div className={styles.team}>
                Ready For It? <span className={styles.score}>76</span>
              </div>
              <div className={styles.team}>
                Diet Pepsi <span className={styles.score}>82</span>
              </div>
            </div>
            {/* Add more matchups */}
          </div>
          
          <div className={`${styles.round} ${styles.roundTwo}`}>
            {/* Round 2 matchups */}
          </div>
          
          <div className={`${styles.round} ${styles.roundThree}`}>
            {/* Round 3 matchups */}
          </div>
        </div>

        <div className={styles.champion}>
          <div className={styles.semisL}>
            <div className={styles.roundDetails}>Final Four</div>
            {/* Semifinal matchup */}
          </div>
          <div className={styles.final}>
            <i className="fa fa-trophy"></i>
            <div className={styles.roundDetails}>Championship</div>
            {/* Championship matchup */}
          </div>
        </div>

        <div className={`${styles.split} ${styles.splitTwo}`}>
          {/* Mirror the left side structure */}
        </div>
      </div>
    </section>
  );
};

export default TournamentBracket;
