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
}

// Sample data - replace with actual data from your backend
const sampleUsers: UserStats[] = [
  { id: 1, username: "JazzMaster", totalPoints: 2500, genres: { jazz: 1200, blues: 800, fusion: 500 }, languages: { english: 1500, spanish: 1000 } },
  { id: 2, username: "RockStar", totalPoints: 2300, genres: { rock: 1400, metal: 900 }, languages: { english: 2000, german: 300 } },
  { id: 3, username: "ClassicalVirtuoso", totalPoints: 2100, genres: { classical: 1600, baroque: 500 }, languages: { italian: 1200, french: 900 } },
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
                  {displayUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-lg border ${
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-crashbow font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <h3 className="text-lg font-crashbow text-white">{user.username}</h3>
                            <p className="text-sm text-gray-400">
                              {currentTab === "genres" 
                                ? `Top Genre: ${Object.entries(user.genres).sort((a, b) => b[1] - a[1])[0][0]}`
                                : `Top Language: ${Object.entries(user.languages).sort((a, b) => b[1] - a[1])[0][0]}`
                              }
                            </p>
                          </div>
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
                    </motion.div>
                  ))}
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
