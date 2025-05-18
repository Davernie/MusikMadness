import React from 'react';
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
    <div className="w-full p-8 overflow-x-auto">
      <div className="relative min-w-[1200px]">
        {/* Tournament logo and title */}
        <div className="text-center mb-16">
          <img 
            src="/src/assets/images/image_transparent.png" 
            alt="MusikMadness" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-crashbow text-white tracking-wider mb-2">
            Pop Showdown Volume. 1
          </h1>
          <p className="text-gray-400">Vote on Soundmap.gg</p>
        </div>

        {/* Bracket structure */}
        <div className="flex justify-between gap-16 relative">
          {/* Round 1 */}
          <div className="flex flex-col justify-around space-y-16">
            <Matchup 
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
            <Matchup 
              player1={{
                name: "Applause",
                artist: "Lady Gaga",
                score: 76,
                rarity: "RARE"
              }}
              player2={{
                name: "you broke me first",
                artist: "Tate McRae",
                score: 24,
                rarity: "RARE"
              }}
            />
          </div>

          {/* Round 2 */}
          <div className="flex flex-col justify-center">
            <div className="relative">
              {/* Connector lines */}
              <div className="absolute left-0 top-1/2 w-16 h-[2px] -translate-x-16 bg-white/10"></div>
              <div className="absolute left-0 top-1/2 w-[2px] h-32 -translate-y-1/2 -translate-x-16 bg-white/10"></div>
              <Matchup 
                player1={{
                  name: "Ready For It?",
                  artist: "Taylor Swift",
                  score: 65,
                  rarity: "RARE"
                }}
                player2={{
                  name: "Applause",
                  artist: "Lady Gaga",
                  score: 35,
                  rarity: "RARE"
                }}
              />
            </div>
          </div>

          {/* Finals */}
          <div className="flex flex-col justify-center">
            <div className="relative">
              {/* Connector lines */}
              <div className="absolute left-0 top-1/2 w-16 h-[2px] -translate-x-16 bg-white/10"></div>
              <div className="absolute left-0 top-1/2 w-[2px] h-32 -translate-y-1/2 -translate-x-16 bg-white/10"></div>
              <Matchup 
                player1={{
                  name: "Ready For It?",
                  artist: "Taylor Swift",
                  score: 52,
                  rarity: "RARE"
                }}
                player2={{
                  name: "Timeless",
                  artist: "The Weekend",
                  score: 48,
                  rarity: "RARE"
                }}
              />
            </div>
          </div>

          {/* Winner */}
          <div className="flex flex-col justify-center">
            <div className="relative">
              <div className="absolute left-0 top-1/2 w-16 h-[2px] -translate-x-16 bg-white/10"></div>
              <div className="w-[300px] p-6 rounded-xl bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm">
                <h2 className="text-center text-white font-crashbow text-xl mb-4">Winner</h2>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                    Ready For It?
                  </h3>
                  <p className="text-gray-400 mt-1">Taylor Swift</p>
                  <div className="mt-4 inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                    52% Victory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
