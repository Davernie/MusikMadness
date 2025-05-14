import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Globe, Award, Crown, Flame, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserStats {
  id: number;
  username: string;
  totalPoints: number;
  genres: Record<string, number>;
  languages: Record<string, number>;
  profile: {
    avatar: string;
    level: number;
    winStreak: number;
    totalWins: number;
    badge: string;
    status: 'online' | 'offline' | 'in-game';
    joinDate: string;
  };
}

// Sample data - replace with actual data from your backend
const sampleUsers: UserStats[] = [
  {
    id: 1,
    username: "BeatMaster3000",
    totalPoints: 15800,
    genres: { electronic: 5200, hiphop: 4800, trap: 3000, dubstep: 2800 },
    languages: { english: 8000, japanese: 4800, korean: 3000 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=1&backgroundType=gradientLinear&backgroundColor=b91c1c,831843",
      level: 75,
      winStreak: 12,
      totalWins: 156,
      badge: "Grand Champion",
      status: 'online',
      joinDate: '2024-01'
    }
  },
  {
    id: 2,
    username: "RhythmQueen",
    totalPoints: 14200,
    genres: { rnb: 4900, soul: 4600, jazz: 4700 },
    languages: { english: 7500, spanish: 6700 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=2&backgroundType=gradientLinear&backgroundColor=4338ca,1d4ed8",
      level: 68,
      winStreak: 8,
      totalWins: 142,
      badge: "Elite Producer",
      status: 'in-game',
      joinDate: '2024-02'
    }
  },
  {
    id: 3,
    username: "SoundScientist",
    totalPoints: 13500,
    genres: { techno: 4800, house: 4500, trance: 4200 },
    languages: { english: 7000, german: 6500 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=3&backgroundType=gradientLinear&backgroundColor=7e22ce,6d28d9",
      level: 65,
      winStreak: 5,
      totalWins: 128,
      badge: "Beat Virtuoso",
      status: 'online',
      joinDate: '2024-01'
    }
  },
  {
    id: 4,
    username: "MelodyMaster",
    totalPoints: 12800,
    genres: { pop: 4400, indie: 4200, alternative: 4200 },
    languages: { english: 6800, french: 6000 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=4&backgroundType=gradientLinear&backgroundColor=ea580c,dc2626",
      level: 62,
      winStreak: 3,
      totalWins: 115,
      badge: "Melody Maven",
      status: 'offline',
      joinDate: '2024-03'
    }
  },
  {
    id: 5,
    username: "BassLegend",
    totalPoints: 12200,
    genres: { dnb: 4300, bassmusic: 4100, garage: 3800 },
    languages: { english: 6500, portuguese: 5700 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=5&backgroundType=gradientLinear&backgroundColor=84cc16,22c55e",
      level: 59,
      winStreak: 4,
      totalWins: 108,
      badge: "Bass Boss",
      status: 'online',
      joinDate: '2024-02'
    }
  },
  {
    id: 6,
    username: "HarmonyHero",
    totalPoints: 11500,
    genres: { classical: 4000, orchestral: 3800, ambient: 3700 },
    languages: { english: 6000, italian: 5500 },
    profile: {
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=6&backgroundType=gradientLinear&backgroundColor=06b6d4,0ea5e9",
      level: 55,
      winStreak: 2,
      totalWins: 98,
      badge: "Harmony Master",
      status: 'offline',
      joinDate: '2024-03'
    }
  }
];

const genres = ["All", "Jazz", "Rock", "Classical", "Blues", "Metal", "Pop", "Electronic"];
const languages = ["All", "English", "Spanish", "French", "German", "Italian", "Japanese"];

const LeaderboardPage = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [currentTab, setCurrentTab] = useState("genres");

  // Function to get rank badge based on position
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-yellow-500 p-2 rounded-full shadow-lg shadow-yellow-500/50"
          >
            <Crown className="h-6 w-6 text-white" />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-gray-300 p-2 rounded-full shadow-lg shadow-gray-300/50"
          >
            <Trophy className="h-6 w-6 text-gray-800" />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-amber-600 p-2 rounded-full shadow-lg shadow-amber-600/50"
          >
            <Star className="h-6 w-6 text-white" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Function to filter users based on selected genre/language
  const filterUsers = (users: UserStats[], category: 'genres' | 'languages', filter: string) => {
    if (filter === "All") return users.sort((a, b) => b.totalPoints - a.totalPoints);
    
    return users.sort((a, b) => {
      const aPoints = category === "genres" 
        ? (a.genres[filter.toLowerCase()] || 0)
        : (a.languages[filter.toLowerCase()] || 0);
      const bPoints = category === "genres"
        ? (b.genres[filter.toLowerCase()] || 0)
        : (b.languages[filter.toLowerCase()] || 0);
      return bPoints - aPoints;
    });
  };

  const displayUsers = currentTab === "genres" 
    ? filterUsers(sampleUsers, "genres", selectedGenre)
    : filterUsers(sampleUsers, "languages", selectedLanguage);

  // Updated display user card render
  const renderUserCard = (user: UserStats, index: number) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-6 rounded-lg border ${
        index === 0
          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
          : index === 1
          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/50'
          : 'bg-gray-800/40 border-white/5 hover:bg-gray-700/40'
      } transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      {getRankBadge(index)}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={user.profile.avatar} 
            alt={user.username} 
            className="w-16 h-16 rounded-lg border-2 border-white/10"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
            user.profile.status === 'online' ? 'bg-green-500' :
            user.profile.status === 'in-game' ? 'bg-purple-500' :
            'bg-gray-500'
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-crashbow text-white flex items-center gap-2">
                {user.username}
                <span className="text-sm px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                  Lvl {user.profile.level}
                </span>
              </h3>
              <p className="text-sm text-gray-400">
                {currentTab === "genres" 
                  ? `Top Genre: ${Object.entries(user.genres).sort((a, b) => b[1] - a[1])[0][0]}`
                  : `Top Language: ${Object.entries(user.languages).sort((a, b) => b[1] - a[1])[0][0]}`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-crashbow font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {currentTab === "genres"
                  ? (selectedGenre === "All"
                    ? user.totalPoints
                    : user.genres[selectedGenre.toLowerCase()] || 0)
                  : (selectedLanguage === "All"
                    ? user.totalPoints
                    : user.languages[selectedLanguage.toLowerCase()] || 0)
                } pts
              </div>
              {index === 0 && (
                <div className="text-xs font-medium text-yellow-500 flex items-center justify-end mt-1">
                  <Flame className="w-4 h-4 mr-1" />
                  VICTORY ROYALE
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center text-purple-400">
              <Trophy className="w-4 h-4 mr-1" />
              {user.profile.totalWins} wins
            </div>
            <div className="flex items-center text-orange-400">
              <Flame className="w-4 h-4 mr-1" />
              {user.profile.winStreak} streak
            </div>
            <div className="bg-gray-700/30 px-2 py-0.5 rounded-full text-gray-300 text-xs">
              {user.profile.badge}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-crashbow text-white mb-2 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            <Award className="mr-3 h-12 w-12 text-purple-400" />
            Battle Royale Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Compete with musicians worldwide and claim your Victory Royale!</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-800/90 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="border-b border-white/10 px-6 pt-4">
              <TabsList className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                <TabsTrigger
                  value="genres"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                >
                  <Music className="h-4 w-4 mr-2" />
                  By Genre
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  By Language
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="genres">
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre) => (
                    <motion.button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedGenre === genre
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="languages">
                <div className="flex flex-wrap gap-2 mb-6">
                  {languages.map((language) => (
                    <motion.button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === language
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      {language}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGenre + selectedLanguage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {displayUsers.map((user, index) => renderUserCard(user, index))}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
