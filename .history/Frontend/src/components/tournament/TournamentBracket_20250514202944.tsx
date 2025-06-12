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

// Mock data for 64 players
const mockTournamentData = {
  rounds: [
    // Round 1 (32 matches)
    Array.from({ length: 32 }, (_, i) => ({
      id: `r1-m${i + 1}`,
      player1: {
        name: `Song ${i * 2 + 1}`,
        artist: `Artist ${i * 2 + 1}`,
        score: Math.floor(Math.random() * 40) + 60,
        rarity: Math.random() > 0.8 ? "RARE" : undefined
      },
      player2: {
        name: `Song ${i * 2 + 2}`,
        artist: `Artist ${i * 2 + 2}`,
        score: Math.floor(Math.random() * 40) + 60,
        rarity: Math.random() > 0.8 ? "RARE" : undefined
      }
    })),
    // Round 2 (16 matches)
    Array.from({ length: 16 }, (_, i) => ({
      id: `r2-m${i + 1}`,
      player1: {
        name: `Winner R1M${i * 2 + 1}`,
        artist: `Artist R1M${i * 2 + 1}`,
        score: Math.floor(Math.random() * 40) + 60
      },
      player2: {
        name: `Winner R1M${i * 2 + 2}`,
        artist: `Artist R1M${i * 2 + 2}`,
        score: Math.floor(Math.random() * 40) + 60
      }
    })),
    // Sweet 16 (8 matches)
    Array.from({ length: 8 }, (_, i) => ({
      id: `r3-m${i + 1}`,
      player1: {
        name: `Winner R2M${i * 2 + 1}`,
        artist: `Artist R2M${i * 2 + 1}`,
        score: Math.floor(Math.random() * 40) + 60
      },
      player2: {
        name: `Winner R2M${i * 2 + 2}`,
        artist: `Artist R2M${i * 2 + 2}`,
        score: Math.floor(Math.random() * 40) + 60
      }
    })),
    // Elite 8 (4 matches)
    Array.from({ length: 4 }, (_, i) => ({
      id: `r4-m${i + 1}`,
      player1: {
        name: `Winner R3M${i * 2 + 1}`,
        artist: `Artist R3M${i * 2 + 1}`,
        score: Math.floor(Math.random() * 40) + 60
      },
      player2: {
        name: `Winner R3M${i * 2 + 2}`,
        artist: `Artist R3M${i * 2 + 2}`,
        score: Math.floor(Math.random() * 40) + 60
      }
    })),
    // Final Four (2 matches)
    Array.from({ length: 2 }, (_, i) => ({
      id: `r5-m${i + 1}`,
      player1: {
        name: `Winner R4M${i * 2 + 1}`,
        artist: `Artist R4M${i * 2 + 1}`,
        score: Math.floor(Math.random() * 40) + 60
      },
      player2: {
        name: `Winner R4M${i * 2 + 2}`,
        artist: `Artist R4M${i * 2 + 2}`,
        score: Math.floor(Math.random() * 40) + 60
      }
    })),
    // Championship (1 match)
    [{
      id: 'championship',
      player1: {
        name: "Winner SF1",
        artist: "Artist SF1",
        score: Math.floor(Math.random() * 40) + 60
      },
      player2: {
        name: "Winner SF2",
        artist: "Artist SF2",
        score: Math.floor(Math.random() * 40) + 60
      }
    }]
  ]
};

const TournamentBracket: React.FC = () => {
  return (
    <>
      <header className={styles.bracketHeader}>
        <ol className={styles.roundLabels}>
          <li className={styles.roundLabel}>Round 1<br/><span>May 14</span></li>
          <li className={styles.roundLabel}>Round 2<br/><span>May 16</span></li>
          <li className={styles.roundLabel}>Sweet 16<br/><span>May 18</span></li>
          <li className={styles.roundLabel}>Elite 8<br/><span>May 20</span></li>
          <li className={styles.roundLabel}>Finals<br/><span>May 22</span></li>
          <li className={styles.roundLabel}>Elite 8<br/><span>May 20</span></li>
          <li className={styles.roundLabel}>Sweet 16<br/><span>May 18</span></li>
          <li className={styles.roundLabel}>Round 2<br/><span>May 16</span></li>
          <li className={styles.roundLabel}>Round 1<br/><span>May 14</span></li>
        </ol>
      </header>

      <div className={styles.bracket}>
        {/* Left side of bracket */}
        <div className={styles.region}>
          {mockTournamentData.rounds[0].slice(0, 8).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[1].slice(0, 4).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[2].slice(0, 2).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[3].slice(0, 1).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>

        {/* Championship */}
        <div className={styles.finalFour}>
          {mockTournamentData.rounds[5].map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>

        {/* Right side of bracket */}
        <div className={styles.region}>
          {mockTournamentData.rounds[3].slice(1, 2).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[2].slice(2, 4).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[1].slice(4, 8).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
        <div className={styles.region}>
          {mockTournamentData.rounds[0].slice(8, 16).map((match) => (
            <BracketMatch key={match.id} player1={match.player1} player2={match.player2} />
          ))}
        </div>
      </div>
    </>
  );
};

export default TournamentBracket;
